import { describe, expect, it } from 'vitest';

import {
  aniosDisponibles,
  mesesDelFiltro,
  resumenIngresos,
  resumenMembresias,
  serieReciente,
  tablaPorPlan,
} from './kpi.helpers';
import {
  ComercialPlanDto,
  DatosGerencia,
  GerenciaIngresosDto,
  GerenciaMembresiasDto,
} from './kpi.models';

const ingresos: GerenciaIngresosDto[] = [
  { rowKey: '2026|8', anio: 2026, mesNumero: 8, mes: 'Agosto', ingresosPeriodoActual: 11179, ingresosPeriodoAnterior: 14768.8, cantidadVentas: 41, tasaCrecimientoIngresos: null },
  { rowKey: '2026|9', anio: 2026, mesNumero: 9, mes: 'Septiembre', ingresosPeriodoActual: 4165, ingresosPeriodoAnterior: 11179, cantidadVentas: 15, tasaCrecimientoIngresos: -62.7 },
  // Año futuro que el DW proyecta vacío: no debe ofrecerse ni ser el año por defecto.
  { rowKey: '2027|1', anio: 2027, mesNumero: 1, mes: 'Enero', ingresosPeriodoActual: 0, ingresosPeriodoAnterior: 4165, cantidadVentas: 0, tasaCrecimientoIngresos: null },
];

const membresias: GerenciaMembresiasDto[] = [
  {
    rowKey: '2026|9', anio: 2026, mesNumero: 9, mes: 'Septiembre',
    clientesActivosInicio: 138, clientesInicioActivosCierre: 120,
    tasaRetencionClientes: 86.9565, membresiasActivas: 124,
    membresiasVencenPeriodo: 31, membresiasCohorteRenovadas: 12,
    tasaRenovacionMembresias: null,
  },
];

const planes: ComercialPlanDto[] = [
  // Dos filas con el mismo tipoPlan: DimPlan unifica plan + operación + promoción.
  { rowKey: '2026|9|A1', anio: 2026, mesNumero: 9, mes: 'Septiembre', tipoPlan: 'ANUAL', ingresosPorTipoPlan: 1000, ventasPorPlan: 1, membresiasVendidas: 1, membresiasVencen: 2, membresiasRenovadas: 1, tasaRenovacionPorPlan: null },
  { rowKey: '2026|9|A2', anio: 2026, mesNumero: 9, mes: 'Septiembre', tipoPlan: 'ANUAL', ingresosPorTipoPlan: 798, ventasPorPlan: 1, membresiasVendidas: 1, membresiasVencen: 2, membresiasRenovadas: 0, tasaRenovacionPorPlan: null },
  { rowKey: '2026|8|A1', anio: 2026, mesNumero: 8, mes: 'Agosto', tipoPlan: 'ANUAL', ingresosPorTipoPlan: 3611, ventasPorPlan: 5, membresiasVendidas: 5, membresiasVencen: 8, membresiasRenovadas: 4, tasaRenovacionPorPlan: null },
];

const datos: DatosGerencia = { ingresos, membresias, planes };

describe('aniosDisponibles', () => {
  it('ignora los años sin ingresos (el DW proyecta años futuros vacíos)', () => {
    expect(aniosDisponibles(datos)).toEqual([2026]);
  });
});

describe('mesesDelFiltro', () => {
  it('usa el último mes con ingresos cuando no hay filtro de mes ni trimestre', () => {
    expect(mesesDelFiltro(ingresos, { anio: 2026, trimestre: 0, mes: 0, plan: '' })).toEqual([9]);
  });

  it('devuelve los tres meses del trimestre', () => {
    expect(mesesDelFiltro(ingresos, { anio: 2026, trimestre: 3, mes: 0, plan: '' })).toEqual([7, 8, 9]);
  });
});

describe('resumenIngresos', () => {
  it('suma los flujos y usa la tasa del último periodo', () => {
    const resumen = resumenIngresos(ingresos.slice(0, 2));
    expect(resumen.actual).toBe(15344);
    expect(resumen.anterior).toBe(25947.8);
    expect(resumen.delta).toBe(-62.7);
  });

  it('deriva la variación si el DW no la manda', () => {
    const resumen = resumenIngresos([ingresos[1]]);
    expect(resumen.delta).toBeCloseTo(-62.74, 1);
  });
});

describe('resumenMembresias', () => {
  it('suma las cohortes pero toma del último mes lo puntual (activas y retención)', () => {
    const resumen = resumenMembresias(membresias);
    expect(resumen.activas).toBe(124);
    expect(resumen.vencen).toBe(31);
    expect(resumen.renovadas).toBe(12);
    expect(resumen.retencion).toBeCloseTo(86.9565, 3);
    expect(resumen.renovacion).toBeCloseTo((12 / 31) * 100, 3);
  });
});

describe('tablaPorPlan', () => {
  it('agrupa por tipoPlan y deja el total cuadrado', () => {
    const tabla = tablaPorPlan(planes, 2026, 9);

    expect(tabla.filas).toHaveLength(1);
    expect(tabla.filas[0]).toMatchObject({
      plan: 'ANUAL',
      ingresos: 1798,
      ingresosAnterior: 3611,
      vendidas: 2,
      vencen: 4,
      renovadas: 1,
    });
    expect(tabla.filas[0].tasa).toBe(25);
    expect(tabla.total?.ingresos).toBe(1798);
    expect(tabla.total?.ingresosAnterior).toBe(3611);
    expect(tabla.total?.tasa).toBe(25);
  });

  it('sin mes no devuelve filas', () => {
    expect(tablaPorPlan(planes, 2026, 0).filas).toHaveLength(0);
  });
});

describe('serieReciente', () => {
  it('toma los últimos N meses hasta el mes indicado', () => {
    const serie = serieReciente(ingresos, 2026, 9, 6);
    expect(serie.labels).toEqual(['Ago', 'Sep']);
    expect(serie.valores).toEqual([11179, 4165]);
  });
});
