/** Catálogos del dominio (meses y tipos de plan) con sus etiquetas para la interfaz. */

export interface Mes {
  readonly n: number;
  readonly nombre: string;
  readonly corto: string;
}

export const MESES: readonly Mes[] = [
  { n: 1, nombre: 'Enero', corto: 'Ene' },
  { n: 2, nombre: 'Febrero', corto: 'Feb' },
  { n: 3, nombre: 'Marzo', corto: 'Mar' },
  { n: 4, nombre: 'Abril', corto: 'Abr' },
  { n: 5, nombre: 'Mayo', corto: 'May' },
  { n: 6, nombre: 'Junio', corto: 'Jun' },
  { n: 7, nombre: 'Julio', corto: 'Jul' },
  { n: 8, nombre: 'Agosto', corto: 'Ago' },
  { n: 9, nombre: 'Septiembre', corto: 'Sep' },
  { n: 10, nombre: 'Octubre', corto: 'Oct' },
  { n: 11, nombre: 'Noviembre', corto: 'Nov' },
  { n: 12, nombre: 'Diciembre', corto: 'Dic' },
];

const ETIQUETAS_PLAN: Readonly<Record<string, string>> = {
  MENSUAL: 'Mensual',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
  QUINQUENAL: 'Quinquenal',
  POR_UN_DIA: 'Por un día',
  NO_APLICA: 'Sin plan',
};

export function mesNombre(numero: number): string {
  return MESES.find((mes) => mes.n === numero)?.nombre ?? `Mes ${numero}`;
}

export function mesCorto(numero: number): string {
  return MESES.find((mes) => mes.n === numero)?.corto ?? '';
}

export function trimestreDe(numeroMes: number): number {
  return Math.ceil(numeroMes / 3);
}

export function etiquetaPlan(tipo: string): string {
  return ETIQUETAS_PLAN[tipo] ?? tipo;
}
