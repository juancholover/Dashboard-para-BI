import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { take } from 'rxjs';

import { etiquetaPlan } from '../../core/catalogs';
import {
  aniosComercial,
  avisosResumen,
  mesesComercial,
  resumenComercial,
  serieIngresosComercial,
  tablaPromociones,
} from '../../core/comercial.helpers';
import { DwApiService } from '../../core/dw-api.service';
import { planFoco, tablaPorPlan } from '../../core/kpi.helpers';
import { DatosComercial, FiltroGerencia } from '../../core/kpi.models';

interface EstadoComercial {
  readonly datos: DatosComercial;
  readonly filtro: FiltroGerencia;
  readonly cargando: boolean;
  readonly cargado: boolean;
  readonly error: string | null;
}

const SIN_DATOS: DatosComercial = {
  planes: [],
  avisos: [],
  promosVentas: [],
  promosMembresias: [],
  promosClientes: [],
};

const ESTADO_INICIAL: EstadoComercial = {
  datos: SIN_DATOS,
  filtro: { anio: 0, trimestre: 0, mes: 0, plan: '' },
  cargando: false,
  cargado: false,
  error: null,
};

const MENSAJE_ERROR = 'No se pudo leer el Data Warehouse. Revisa la conexión y reintenta con Actualizar.';

/** Estado del panel de Administración y Comercial: planes, avisos y promociones. */
export const ComercialStore = signalStore(
  { providedIn: 'root' },
  withState(ESTADO_INICIAL),
  withComputed((store) => {
    const meses = computed(() => mesesComercial(store.datos().planes, store.filtro()));
    const anios = computed(() => aniosComercial(store.datos().planes));
    const corte = computed(() => (meses().length ? meses()[meses().length - 1] : 0));

    const resumen = computed(() =>
      resumenComercial(store.datos().planes, store.filtro().anio, meses()),
    );
    const tabla = computed(() => tablaPorPlan(store.datos().planes, store.filtro().anio, corte()));

    const tablaVisible = computed(() => {
      const plan = store.filtro().plan;
      if (!plan) return tabla();
      return { ...tabla(), filas: tabla().filas.filter((fila) => fila.plan === plan) };
    });

    const serie = computed(() =>
      serieIngresosComercial(store.datos().planes, store.filtro().anio, corte(), 6),
    );

    const avisos = computed(() => avisosResumen(store.datos().avisos));

    const promociones = computed(() =>
      tablaPromociones(
        store.datos().promosVentas,
        store.datos().promosMembresias,
        store.filtro().anio,
        meses(),
      ),
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
      corte,
      resumen,
      tabla,
      tablaVisible,
      serie,
      avisos,
      promociones,
      planesDisponibles,
      foco: computed(() => planFoco(tabla())),
    };
  }),
  withMethods((store, api = inject(DwApiService)) => ({
    cargar(): void {
      patchState(store, { cargando: true, error: null });

      api
        .cargarComercial()
        .pipe(take(1))
        .subscribe({
          next: (datos) => {
            const anio = store.filtro().anio || aniosComercial(datos.planes)[0] || new Date().getFullYear();
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
