/**
 * Lógica de negocio del panel de Gerencia, en funciones puras (fáciles de probar).
 *
 * Reglas tomadas de las vistas del DW (`sql/05_metricas_datamart.sql`):
 *  - Los flujos y las cohortes son sumables (ingresos, ventas, vencen, renovadas).
 *  - `membresiasActivas` y la retención son puntuales del mes: se toma el último, no se suman.
 *  - `DM_Comercial_Plan` trae varias filas por `tipo_plan` (DimPlan unifica plan+operación+promoción):
 *    hay que agrupar por `tipo_plan` antes de sumar.
 */
import { mesCorto } from './catalogs';
import {
  ComercialPlanDto,
  DatosGerencia,
  FilaPlan,
  FiltroGerencia,
  GerenciaIngresosDto,
  GerenciaMembresiasDto,
  PeriodoSeleccionado,
  ResumenIngresos,
  ResumenMembresias,
  SerieCobros,
  TablaPlanes,
} from './kpi.models';

type FilaConPeriodo = { readonly anio: number; readonly mesNumero: number };

function suma<T, K extends keyof T>(filas: readonly T[], campo: K): number {
  return filas.reduce<number>((total, fila) => total + (Number(fila[campo]) || 0), 0);
}

/** Último mes con actividad real del año (0 si el año no tiene actividad). */
export function ultimoMesConActividad(
  filas: readonly FilaConPeriodo[],
  anio: number,
  campo: string,
): number {
  const delAnio = filas.filter((fila) => fila.anio === anio);
  const activos = delAnio.filter((fila) => (Number((fila as Record<string, unknown>)[campo]) || 0) > 0);
  return activos.length ? activos[activos.length - 1].mesNumero : 0;
}

/** Meses que abarca el filtro. Por defecto, el último mes con ingresos del año. */
export function mesesDelFiltro(
  ingresos: readonly GerenciaIngresosDto[],
  filtro: FiltroGerencia,
): readonly number[] {
  if (filtro.mes) return [filtro.mes];
  if (filtro.trimestre) {
    const fin = filtro.trimestre * 3;
    return [fin - 2, fin - 1, fin];
  }
  const ultimo = ultimoMesConActividad(ingresos, filtro.anio, 'ingresosPeriodoActual');
  return ultimo ? [ultimo] : [];
}

export function filtrarPorPeriodo<T extends FilaConPeriodo>(
  filas: readonly T[],
  anio: number,
  meses: readonly number[],
): T[] {
  return filas.filter((fila) => fila.anio === anio && meses.includes(fila.mesNumero));
}

/** Años que tienen ingresos reales (el DW proyecta años futuros vacíos). */
export function aniosDisponibles(datos: DatosGerencia): number[] {
  const vistos = new Set<number>();
  datos.ingresos.forEach((fila) => {
    if (fila.anio >= 2000 && fila.ingresosPeriodoActual > 0) vistos.add(fila.anio);
  });
  return [...vistos].sort((a, b) => b - a);
}

export function periodoDe(meses: readonly number[], filasIngresos: readonly GerenciaIngresosDto[]): PeriodoSeleccionado {
  const mesCorte = filasIngresos.length
    ? filasIngresos[filasIngresos.length - 1].mesNumero
    : (meses.length ? meses[meses.length - 1] : 0);
  return {
    meses,
    mesCorte,
    mesPrevio: mesCorte > 1 ? mesCorte - 1 : 12,
    esRango: meses.length > 1,
  };
}

export function resumenIngresos(filas: readonly GerenciaIngresosDto[]): ResumenIngresos {
  if (!filas.length) return { actual: 0, anterior: 0, delta: null, ventas: 0 };

  const actual = suma(filas, 'ingresosPeriodoActual');
  const anterior = suma(filas, 'ingresosPeriodoAnterior');
  const tasa = filas[filas.length - 1].tasaCrecimientoIngresos;
  const delta =
    tasa === null || tasa === undefined
      ? anterior > 0
        ? ((actual - anterior) / anterior) * 100
        : null
      : Number(tasa);

  return { actual, anterior, delta, ventas: suma(filas, 'cantidadVentas') };
}

export function resumenMembresias(filas: readonly GerenciaMembresiasDto[]): ResumenMembresias {
  if (!filas.length) {
    return { activas: 0, vencen: 0, renovadas: 0, renovacion: null, retencion: null, inicio: 0, cierre: 0 };
  }

  const ultimo = filas[filas.length - 1];
  const vencen = suma(filas, 'membresiasVencenPeriodo');
  const renovadas = suma(filas, 'membresiasCohorteRenovadas');
  const tasa = ultimo.tasaRenovacionMembresias;

  return {
    activas: ultimo.membresiasActivas,
    vencen,
    renovadas,
    renovacion: tasa === null || tasa === undefined ? (vencen > 0 ? (renovadas / vencen) * 100 : null) : Number(tasa),
    retencion: ultimo.tasaRetencionClientes,
    inicio: ultimo.clientesActivosInicio,
    cierre: ultimo.clientesInicioActivosCierre,
  };
}

function acumularPlan(
  acumulado: { ingresos: number; vendidas: number; vencen: number; renovadas: number },
  registro: ComercialPlanDto,
): void {
  acumulado.ingresos += registro.ingresosPorTipoPlan || 0;
  acumulado.vendidas += registro.membresiasVendidas || 0;
  acumulado.vencen += registro.membresiasVencen || 0;
  acumulado.renovadas += registro.membresiasRenovadas || 0;
}

export function tablaPorPlan(
  planes: readonly ComercialPlanDto[],
  anio: number,
  mes: number,
): TablaPlanes {
  if (!mes) return { filas: [], total: null };

  const anioAnterior = mes === 1 ? anio - 1 : anio;
  const mesAnterior = mes === 1 ? 12 : mes - 1;

  const actuales = new Map<string, { ingresos: number; vendidas: number; vencen: number; renovadas: number }>();
  const ingresosPrevios = new Map<string, number>();

  planes.forEach((registro) => {
    if (!registro.tipoPlan) return;
    if (registro.anio === anio && registro.mesNumero === mes) {
      const acumulado = actuales.get(registro.tipoPlan) ?? { ingresos: 0, vendidas: 0, vencen: 0, renovadas: 0 };
      acumularPlan(acumulado, registro);
      actuales.set(registro.tipoPlan, acumulado);
    } else if (registro.anio === anioAnterior && registro.mesNumero === mesAnterior) {
      ingresosPrevios.set(
        registro.tipoPlan,
        (ingresosPrevios.get(registro.tipoPlan) ?? 0) + (registro.ingresosPorTipoPlan || 0),
      );
    }
  });

  const tipos = new Set<string>([...actuales.keys(), ...ingresosPrevios.keys()]);

  const filas: FilaPlan[] = [...tipos]
    .map((tipo) => {
      const acumulado = actuales.get(tipo) ?? { ingresos: 0, vendidas: 0, vencen: 0, renovadas: 0 };
      return {
        plan: tipo,
        ingresos: acumulado.ingresos,
        ingresosAnterior: ingresosPrevios.get(tipo) ?? 0,
        vendidas: acumulado.vendidas,
        vencen: acumulado.vencen,
        renovadas: acumulado.renovadas,
        tasa: acumulado.vencen > 0 ? (acumulado.renovadas / acumulado.vencen) * 100 : null,
      };
    })
    .filter(
      (fila) =>
        fila.ingresos > 0 || fila.vendidas > 0 || fila.vencen > 0 || fila.renovadas > 0 || fila.ingresosAnterior > 0,
    )
    .sort((a, b) => b.ingresos - a.ingresos);

  const total: FilaPlan = {
    plan: 'Total',
    ingresos: suma(filas, 'ingresos'),
    ingresosAnterior: suma(filas, 'ingresosAnterior'),
    vendidas: suma(filas, 'vendidas'),
    vencen: suma(filas, 'vencen'),
    renovadas: suma(filas, 'renovadas'),
    tasa: null,
  };

  return {
    filas,
    total: total.vencen > 0 ? { ...total, tasa: (total.renovadas / total.vencen) * 100 } : total,
  };
}

export function serieReciente(
  ingresos: readonly GerenciaIngresosDto[],
  anio: number,
  mes: number,
  cantidad: number,
): SerieCobros {
  const filas = ingresos.filter((fila) => fila.anio === anio && fila.mesNumero <= mes).slice(-cantidad);
  return {
    labels: filas.map((fila) => mesCorto(fila.mesNumero)),
    valores: filas.map((fila) => fila.ingresosPeriodoActual || 0),
  };
}

/** El plan con menor tasa de renovación entre los que tenían vencimientos (para el "foco"). */
export function planFoco(tabla: TablaPlanes): FilaPlan | null {
  const candidatos = tabla.filas
    .filter((fila) => fila.vencen > 0 && fila.tasa !== null)
    .slice()
    .sort((a, b) => (a.tasa ?? 0) - (b.tasa ?? 0));
  return candidatos.length ? candidatos[0] : null;
}
