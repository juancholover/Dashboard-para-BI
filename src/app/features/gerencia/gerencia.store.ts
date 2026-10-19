import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { take } from 'rxjs';

import { DwApiService } from '../../core/dw-api.service';
import { etiquetaPlan } from '../../core/catalogs';
import {
  aniosDisponibles,
  filtrarPorPeriodo,
  mesesDelFiltro,
  periodoDe,
  planFoco,
  resumenIngresos,
  resumenMembresias,
  serieReciente,
  tablaPorPlan,
} from '../../core/kpi.helpers';
import { DatosGerencia, FiltroGerencia } from '../../core/kpi.models';

interface EstadoGerencia {
  readonly datos: DatosGerencia;
  readonly filtro: FiltroGerencia;
  readonly cargando: boolean;
  readonly cargado: boolean;
  readonly error: string | null;
}

const SIN_DATOS: DatosGerencia = { ingresos: [], membresias: [], planes: [] };

const ESTADO_INICIAL: EstadoGerencia = {
  datos: SIN_DATOS,
  filtro: { anio: 0, trimestre: 0, mes: 0, plan: '' },
  cargando: false,
  cargado: false,
  error: null,
};

const MENSAJE_ERROR = 'No se pudo leer el Data Warehouse. Revisa la conexión y reintenta con Actualizar.';

/** Estado del panel de Gerencia: datos del DW, filtros y todo lo derivado. */
export const GerenciaStore = signalStore(
  { providedIn: 'root' },
  withState(ESTADO_INICIAL),
  withComputed((store) => {
    const meses = computed(() => mesesDelFiltro(store.datos().ingresos, store.filtro()));
    const anios = computed(() => aniosDisponibles(store.datos()));

    const filasIngresos = computed(() =>
      filtrarPorPeriodo(store.datos().ingresos, store.filtro().anio, meses()),
    );
    const filasMembresias = computed(() =>
      filtrarPorPeriodo(store.datos().membresias, store.filtro().anio, meses()),
    );

    const periodo = computed(() => periodoDe(meses(), filasIngresos()));
    const ingresos = computed(() => resumenIngresos(filasIngresos()));
    const membresias = computed(() => resumenMembresias(filasMembresias()));
    const tabla = computed(() => tablaPorPlan(store.datos().planes, store.filtro().anio, periodo().mesCorte));

    const tablaVisible = computed(() => {
      const plan = store.filtro().plan;
      if (!plan) return tabla();
      return { ...tabla(), filas: tabla().filas.filter((fila) => fila.plan === plan) };
    });

    const serie = computed(() =>
      serieReciente(store.datos().ingresos, store.filtro().anio, periodo().mesCorte, 6),
    );

    const planesDisponibles = computed(() => {
      const vistos = new Set<string>();
      store.datos().planes.forEach((fila) => {
        if (fila.tipoPlan && fila.tipoPlan !== 'NO_APLICA') vistos.add(fila.tipoPlan);
      });
      return [...vistos].sort().map((valor) => ({ valor, etiqueta: etiquetaPlan(valor) }));
    });

    return {
      meses,
      anios,
      periodo,
      ingresos,
      membresias,
      tabla,
      tablaVisible,
      serie,
      planesDisponibles,
      foco: computed(() => planFoco(tabla())),
    };
  }),
  withMethods((store, api = inject(DwApiService)) => ({
    cargar(): void {
      patchState(store, { cargando: true, error: null });

      api
        .cargarGerencia()
        .pipe(take(1))
        .subscribe({
          next: (datos) => {
            const anio = store.filtro().anio || aniosDisponibles(datos)[0] || new Date().getFullYear();
            patchState(store, {
              datos,
              cargando: false,
              cargado: true,
              filtro: { ...store.filtro(), anio },
            });
          },
          error: (fallo: unknown) => {
            console.error('Error al leer el DW:', fallo);
            patchState(store, { cargando: false, cargado: true, error: MENSAJE_ERROR });
          },
        });
    },

    setAnio(anio: number): void {
      patchState(store, { filtro: { ...store.filtro(), anio, mes: 0, trimestre: 0 } });
    },

    setTrimestre(trimestre: number): void {
      patchState(store, { filtro: { ...store.filtro(), trimestre, mes: 0 } });
    },

    setMes(mes: number): void {
      patchState(store, { filtro: { ...store.filtro(), mes, trimestre: 0 } });
    },

    setPlan(plan: string): void {
      patchState(store, { filtro: { ...store.filtro(), plan } });
    },

    alternarPlan(plan: string): void {
      const actual = store.filtro().plan;
      patchState(store, { filtro: { ...store.filtro(), plan: actual === plan ? '' : plan } });
    },
  })),
  withHooks({
    onInit: (store) => store.cargar(),
  }),
);
