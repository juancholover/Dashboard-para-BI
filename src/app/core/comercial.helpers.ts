/**
 * Lógica pura del panel de Administración y Comercial (probable sin Angular).
 * Reglas del DW: los flujos son sumables; `DM_Comercial_Plan` trae varias filas por
 * `tipo_plan`, por lo que se agrega antes de sumar (misma regla que Gerencia).
 */
import { mesCorto } from './catalogs';
import {
  AvisosCoberturaDto,
  ComercialPlanDto,
  FilaPromocion,
  FiltroGerencia,
  PromocionesMembresiasDto,
  PromocionesVentasDto,
  ResumenAvisos,
  ResumenComercial,
  SerieCobros,
} from './kpi.models';

function suma<T, K extends keyof T>(filas: readonly T[], campo: K): number {
  return filas.reduce<number>((total, fila) => total + (Number(fila[campo]) || 0), 0);
}

/** Años con ingresos reales (el DW proyecta años futuros vacíos y un centinela 1900). */
export function aniosComercial(planes: readonly ComercialPlanDto[]): number[] {
  const vistos = new Set<number>();
  planes.forEach((fila) => {
    if (fila.anio >= 2000 && (Number(fila.ingresosPorTipoPlan) || 0) > 0) vistos.add(fila.anio);
  });
  return [...vistos].sort((a, b) => b - a);
}

/** Último mes con ingresos del año (0 si no hay actividad). */
export function ultimoMesComercial(planes: readonly ComercialPlanDto[], anio: number): number {
  const activos = planes.filter(
    (fila) => fila.anio === anio && (Number(fila.ingresosPorTipoPlan) || 0) > 0,
  );
  return activos.length ? activos[activos.length - 1].mesNumero : 0;
}

/** Meses que abarca el filtro. Por defecto, el último mes con ingresos del año. */
export function mesesComercial(
  planes: readonly ComercialPlanDto[],
  filtro: FiltroGerencia,
): readonly number[] {
  if (filtro.mes) return [filtro.mes];
  if (filtro.trimestre) {
    const fin = filtro.trimestre * 3;
    return [fin - 2, fin - 1, fin];
  }
  const ultimo = ultimoMesComercial(planes, filtro.anio);
  return ultimo ? [ultimo] : [];
}

export function filtrarPlanesComercial(
  planes: readonly ComercialPlanDto[],
  anio: number,
  meses: readonly number[],
): ComercialPlanDto[] {
  return planes.filter((fila) => fila.anio === anio && meses.includes(fila.mesNumero));
}

/** Resumen del período: ingresos/ventas y el bloque de renovación, con comparativo mensual. */
export function resumenComercial(
  planes: readonly ComercialPlanDto[],
  anio: number,
  meses: readonly number[],
): ResumenComercial {
  const corte = meses.length ? meses[meses.length - 1] : 0;
  if (!corte) {
    return {
      ingresos: 0, ingresosAnterior: 0, delta: null, ventas: 0,
      vendidas: 0, vencen: 0, renovadas: 0, renovacion: null,
    };
  }

  const filas = filtrarPlanesComercial(planes, anio, meses);
  const ingresos = suma(filas, 'ingresosPorTipoPlan');
  const vencen = suma(filas, 'membresiasVencen');
  const renovadas = suma(filas, 'membresiasRenovadas');

  const anioPrevio = corte === 1 ? anio - 1 : anio;
  const mesPrevio = corte === 1 ? 12 : corte - 1;
  const previos = planes.filter((fila) => fila.anio === anioPrevio && fila.mesNumero === mesPrevio);
  const ingresosAnterior = suma(previos, 'ingresosPorTipoPlan');

  return {
    ingresos,
    ingresosAnterior,
    delta: ingresosAnterior > 0 ? ((ingresos - ingresosAnterior) / ingresosAnterior) * 100 : null,
    ventas: suma(filas, 'ventasPorPlan'),
    vendidas: suma(filas, 'membresiasVendidas'),
    vencen,
    renovadas,
    renovacion: vencen > 0 ? (renovadas / vencen) * 100 : null,
  };
}

/** Serie mensual de ingresos por plan (últimos `cantidad` meses hasta el corte). */
export function serieIngresosComercial(
  planes: readonly ComercialPlanDto[],
  anio: number,
  mes: number,
  cantidad: number,
): SerieCobros {
  const meses = [...new Set(
    planes
      .filter((fila) => fila.anio === anio && fila.mesNumero <= mes && (Number(fila.ingresosPorTipoPlan) || 0) > 0)
      .map((fila) => fila.mesNumero),
  )].sort((a, b) => a - b).slice(-cantidad);

  return {
    labels: meses.map((numero) => mesCorto(numero)),
    valores: meses.map((numero) =>
      suma(planes.filter((fila) => fila.anio === anio && fila.mesNumero === numero), 'ingresosPorTipoPlan'),
    ),
  };
}

/** Cobertura de avisos: se toma la última fecha de corte disponible. */
export function avisosResumen(avisos: readonly AvisosCoberturaDto[]): ResumenAvisos {
  if (!avisos.length) return { fechaCorte: null, proximas: 0, emitidos: 0, tasa: null };
  const ordenados = [...avisos].sort((a, b) => String(a.fechaCorte).localeCompare(String(b.fechaCorte)));
  const ultimo = ordenados[ordenados.length - 1];
  return {
    fechaCorte: ultimo.fechaCorte,
    proximas: Number(ultimo.membresiasProximasVencer) || 0,
    emitidos: Number(ultimo.avisosRenovacionEmitidos) || 0,
    tasa: ultimo.tasaCoberturaAvisos,
  };
}

/** Acumulador mutable interno (se expone como `FilaPromocion` de solo lectura). */
interface AcumuladoPromocion {
  promocion: string;
  ingresos: number;
  ventas: number;
  descuento: number;
  membresiasVendidas: number;
  membresiasRenovadas: number;
}

/** Ventas y membresías bajo promoción, agregadas por nombre de promoción. */
export function tablaPromociones(
  promosVentas: readonly PromocionesVentasDto[],
  promosMembresias: readonly PromocionesMembresiasDto[],
  anio: number,
  meses: readonly number[],
): FilaPromocion[] {
  const acumulado = new Map<string, AcumuladoPromocion>();
  const obtener = (nombre: string): AcumuladoPromocion => {
    const actual = acumulado.get(nombre);
    if (actual) return actual;
    const nueva: AcumuladoPromocion = {
      promocion: nombre, ingresos: 0, ventas: 0, descuento: 0,
      membresiasVendidas: 0, membresiasRenovadas: 0,
    };
    acumulado.set(nombre, nueva);
    return nueva;
  };

  promosVentas.forEach((fila) => {
    if (!fila.promocion || fila.promocion === 'SIN PROMOCION') return;
    if (fila.anio !== anio || !meses.includes(fila.mesNumero)) return;
    const destino = obtener(fila.promocion);
    destino.ingresos += Number(fila.ingresosPorPromocion) || 0;
    destino.ventas += Number(fila.ventasPorPromocion) || 0;
    destino.descuento += Number(fila.descuentoOtorgado) || 0;
  });

  promosMembresias.forEach((fila) => {
    if (!fila.promocion || fila.promocion === 'SIN PROMOCION') return;
    if (fila.anio !== anio || !meses.includes(fila.mesNumero)) return;
    const destino = obtener(fila.promocion);
    destino.membresiasVendidas += Number(fila.membresiasVendidas) || 0;
    destino.membresiasRenovadas += Number(fila.membresiasRenovadas) || 0;
  });

  return [...acumulado.values()]
    .filter((fila) => fila.ingresos > 0 || fila.ventas > 0 || fila.membresiasVendidas > 0)
    .sort((a, b) => b.ingresos - a.ingresos);
}
