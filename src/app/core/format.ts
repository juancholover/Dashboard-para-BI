/** Formateo de cifras para la interfaz (es-PE). */

const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  maximumFractionDigits: 0,
});

const formatoEntero = new Intl.NumberFormat('es-PE');

export function money(valor: number | null | undefined): string {
  return formatoMoneda.format(Number(valor) || 0);
}

export function integer(valor: number | null | undefined): string {
  return formatoEntero.format(Number(valor) || 0);
}

export function signoPeso(valor: number): string {
  return `${valor >= 0 ? '+' : '−'}${money(Math.abs(valor))}`;
}

/** Las tasas del DW llegan con muchos decimales (28.571428571428): se redondean a 1. */
export function porcentaje(valor: number | null | undefined): string {
  const numero = Number(valor);
  if (valor === null || valor === undefined || !Number.isFinite(numero)) return '—';
  return String(Math.round(numero * 10) / 10);
}

export function porcentajeTexto(valor: number | null | undefined): string {
  const texto = porcentaje(valor);
  return texto === '—' ? texto : `${texto} %`;
}

export function deltaTexto(delta: number): string {
  return `${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(1).replace('.', ',')} %`;
}

/** Ancho (0–100) para las barras de progreso. */
export function anchoBarra(valor: number | null | undefined): number {
  const numero = Number(valor);
  if (valor === null || valor === undefined || !Number.isFinite(numero)) return 0;
  return Math.max(0, Math.min(100, numero));
}
