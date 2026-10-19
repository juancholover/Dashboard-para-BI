/**
 * DTOs de las vistas del Data Warehouse (espejo de los records del backend) y modelos de vista.
 * Los nombres coinciden con el JSON camelCase que publica la API.
 */

export interface GerenciaIngresosDto {
  readonly rowKey: string;
  readonly anio: number;
  readonly mesNumero: number;
  readonly mes: string;
  readonly ingresosPeriodoActual: number;
  readonly ingresosPeriodoAnterior: number | null;
  readonly cantidadVentas: number;
  readonly tasaCrecimientoIngresos: number | null;
}

export interface GerenciaMembresiasDto {
  readonly rowKey: string;
  readonly anio: number;
  readonly mesNumero: number;
  readonly mes: string;
  readonly clientesActivosInicio: number;
  readonly clientesInicioActivosCierre: number;
  readonly tasaRetencionClientes: number | null;
  readonly membresiasActivas: number;
  readonly membresiasVencenPeriodo: number;
  readonly membresiasCohorteRenovadas: number;
  readonly tasaRenovacionMembresias: number | null;
}

export interface ComercialPlanDto {
  readonly rowKey: string;
  readonly anio: number;
  readonly mesNumero: number;
  readonly mes: string;
  readonly tipoPlan: string;
  readonly ingresosPorTipoPlan: number;
  readonly ventasPorPlan: number;
  readonly membresiasVendidas: number;
  readonly membresiasVencen: number;
  readonly membresiasRenovadas: number;
  readonly tasaRenovacionPorPlan: number | null;
}

/** Las tres fuentes de datos del panel de Gerencia. */
export interface DatosGerencia {
  readonly ingresos: readonly GerenciaIngresosDto[];
  readonly membresias: readonly GerenciaMembresiasDto[];
  readonly planes: readonly ComercialPlanDto[];
}

/** Estado de los filtros. `0` en trimestre/mes y `''` en plan significan "todos". */
export interface FiltroGerencia {
  anio: number;
  trimestre: number;
  mes: number;
  plan: string;
}

export interface PeriodoSeleccionado {
  readonly meses: readonly number[];
  readonly mesCorte: number;
  readonly mesPrevio: number;
  readonly esRango: boolean;
}

export interface ResumenIngresos {
  readonly actual: number;
  readonly anterior: number;
  readonly delta: number | null;
  readonly ventas: number;
}

export interface ResumenMembresias {
  readonly activas: number;
  readonly vencen: number;
  readonly renovadas: number;
  readonly renovacion: number | null;
  readonly retencion: number | null;
  readonly inicio: number;
  readonly cierre: number;
}

export interface FilaPlan {
  readonly plan: string;
  readonly ingresos: number;
  readonly ingresosAnterior: number;
  readonly vendidas: number;
  readonly vencen: number;
  readonly renovadas: number;
  readonly tasa: number | null;
}

export interface TablaPlanes {
  readonly filas: readonly FilaPlan[];
  readonly total: FilaPlan | null;
}

export interface SerieCobros {
  readonly labels: readonly string[];
  readonly valores: readonly number[];
}
