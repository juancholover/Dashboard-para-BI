import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { etiquetaPlan, mesCorto, mesNombre } from '../../core/catalogs';
import { deltaTexto, integer, money, porcentaje, porcentajeTexto, signoPeso } from '../../core/format';
import { ChartCanvas } from '../../shared/chart';
import { FilterBar } from '../../shared/filter-bar';
import { KpiCard } from '../../shared/kpi-card';
import { GerenciaStore } from './gerencia.store';
import { TablaPlanes } from './tabla-planes';

/** Panel de Gerencia General (Savia): hero de ingresos, tarjetas, tabla por plan y foco del periodo. */
@Component({
  selector: 'app-gerencia-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterBar, KpiCard, ChartCanvas, TablaPlanes],
  templateUrl: './gerencia-page.html',
})
export class GerenciaPage {
  protected readonly store = inject(GerenciaStore);

  protected readonly money = money;
  protected readonly integer = integer;
  protected readonly porcentajeTexto = porcentajeTexto;
  protected readonly mesCorto = mesCorto;

  protected readonly estadoTexto = computed(() => {
    if (this.store.error()) return 'Sin conexión';
    return this.store.cargado() && !this.store.cargando() ? 'Conectado al DW' : 'Conectando…';
  });

  protected readonly claseIndicador = computed(() => {
    const base = 'h-2 w-2 rounded-full transition-colors';
    if (this.store.error()) return `${base} bg-alert`;
    if (this.store.cargado() && !this.store.cargando()) return `${base} bg-pos`;
    return `${base} bg-sage animate-pulse`;
  });

  protected readonly periodoTexto = computed(() => {
    const { mesCorte, meses } = this.store.periodo();
    if (!mesCorte) return 'Sin datos';
    return meses.length > 1
      ? `${mesCorto(meses[0])} — ${mesCorto(mesCorte)} ${this.store.filtro().anio}`
      : `${mesNombre(mesCorte)} de ${this.store.filtro().anio}`;
  });

  protected readonly corteTexto = computed(() => {
    const { mesCorte, mesPrevio, meses } = this.store.periodo();
    if (!mesCorte) return '';
    const cierre = mesNombre(mesCorte).toLowerCase();
    return meses.length > 1
      ? `Corte al cierre de ${cierre} · Comparación con los ${meses.length} meses previos`
      : `Corte al cierre de ${cierre} · Comparación con ${mesNombre(mesPrevio).toLowerCase()}`;
  });

  protected readonly textoDelta = computed(() => {
    const delta = this.store.ingresos().delta;
    if (delta === null) return 'Sin comparativo';
    const { esRango, meses, mesPrevio } = this.store.periodo();
    const referencia = esRango ? `los ${meses.length} meses previos` : mesNombre(mesPrevio).toLowerCase();
    return `${deltaTexto(delta)} vs. ${referencia}`;
  });

  protected readonly claseDelta = computed(() => {
    const base = 'rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap';
    const delta = this.store.ingresos().delta;
    if (delta === null) return `${base} bg-bone/15 font-medium text-bone`;
    return delta >= 0 ? `${base} bg-bone text-sage-deep` : `${base} bg-[#f2dcd5] text-[#8c3a26]`;
  });

  protected readonly textoPrevio = computed(() => {
    const { esRango, mesPrevio } = this.store.periodo();
    const anterior = money(this.store.ingresos().anterior);
    return esRango ? `Periodo previo: ${anterior}` : `${mesNombre(mesPrevio)}: ${anterior}`;
  });

  protected readonly rangoGrafico = computed(() => {
    const { labels } = this.store.serie();
    return labels.length ? `${labels[0]} — ${labels[labels.length - 1]} ${this.store.filtro().anio}` : '';
  });

  protected readonly cierreActivas = computed(() => {
    const { mesCorte } = this.store.periodo();
    return mesCorte ? `Al cierre de ${mesNombre(mesCorte).toLowerCase()}` : '';
  });

  protected readonly detalleRenovacion = computed(() => {
    const { renovadas, vencen } = this.store.membresias();
    return `${integer(renovadas)} de ${integer(vencen)} renovadas`;
  });

  protected readonly detalleRetencion = computed(() => {
    const { cierre, inicio } = this.store.membresias();
    return `${integer(cierre)} de ${integer(inicio)} siguen activos`;
  });

  protected readonly tablaPeriodo = computed(() => {
    const { mesCorte } = this.store.periodo();
    if (!mesCorte) return '';
    const plan = this.store.filtro().plan;
    return `${mesNombre(mesCorte)} ${this.store.filtro().anio}${plan ? ` · Plan ${etiquetaPlan(plan)}` : ''}`;
  });

  protected readonly cabeceraActual = computed(() => {
    const mes = this.store.periodo().mesCorte;
    return mes ? `Ingresos ${mesCorto(mes).toLowerCase()}.` : 'Ingresos';
  });

  protected readonly cabeceraPrevia = computed(() => {
    const { mesCorte, mesPrevio } = this.store.periodo();
    return mesCorte ? `Ingresos ${mesCorto(mesPrevio).toLowerCase()}.` : 'Ingresos';
  });

  protected readonly textoFoco = computed(() => {
    const foco = this.store.foco();
    if (!foco) return 'Sin cohortes con vencimientos en el periodo seleccionado.';
    return (
      `Plan ${etiquetaPlan(foco.plan).toLowerCase()}: ${integer(foco.renovadas)} de ${integer(foco.vencen)} ` +
      `renovaron (${porcentaje(foco.tasa)} %). Revisar los motivos de no renovación de esa cohorte.`
    );
  });

  protected readonly signoPeso = signoPeso;
}
