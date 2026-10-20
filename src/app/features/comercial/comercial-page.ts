import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { etiquetaPlan, mesCorto, mesNombre } from '../../core/catalogs';
import { deltaTexto, integer, money, porcentajeTexto, signoPeso } from '../../core/format';
import { ChartCanvas } from '../../shared/chart';
import { FilterBar } from '../../shared/filter-bar';
import { KpiCard } from '../../shared/kpi-card';
import { TablaPlanes } from '../gerencia/tabla-planes';
import { ComercialStore } from './comercial.store';
import { TablaPromociones } from './tabla-promociones';

/** Panel de Administración y Área Comercial: planes, renovación, avisos y promociones. */
@Component({
  selector: 'app-comercial-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FilterBar, KpiCard, ChartCanvas, TablaPlanes, TablaPromociones],
  templateUrl: './comercial-page.html',
})
export class ComercialPage {
  protected readonly store = inject(ComercialStore);

  protected readonly money = money;
  protected readonly integer = integer;
  protected readonly porcentajeTexto = porcentajeTexto;
  protected readonly mesCorto = mesCorto;
  protected readonly signoPeso = signoPeso;

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
    const lista = this.store.meses();
    const anio = this.store.filtro().anio;
    if (!lista.length) return 'Sin datos';
    const corte = lista[lista.length - 1];
    return lista.length > 1
      ? `${mesCorto(lista[0])} — ${mesCorto(corte)} ${anio}`
      : `${mesNombre(corte)} de ${anio}`;
  });

  protected readonly corteTexto = computed(() => {
    const lista = this.store.meses();
    if (!lista.length) return '';
    const corte = lista[lista.length - 1];
    const cierre = mesNombre(corte).toLowerCase();
    return lista.length > 1
      ? `Corte al cierre de ${cierre} · Comparación con los ${lista.length} meses previos`
      : `Corte al cierre de ${cierre} · Comparación con ${mesNombre(corte > 1 ? corte - 1 : 12).toLowerCase()}`;
  });

  protected readonly textoDelta = computed(() => {
    const delta = this.store.resumen().delta;
    if (delta === null) return 'Sin comparativo';
    const lista = this.store.meses();
    const referencia =
      lista.length > 1
        ? `los ${lista.length} meses previos`
        : mesNombre(lista.length ? lista[0] - 1 || 12 : 0).toLowerCase();
    return `${deltaTexto(delta)} vs. ${referencia}`;
  });

  protected readonly claseDelta = computed(() => {
    const base = 'rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap';
    const delta = this.store.resumen().delta;
    if (delta === null) return `${base} bg-bone/15 font-medium text-bone`;
    return delta >= 0 ? `${base} bg-bone text-sage-deep` : `${base} bg-[#f2dcd5] text-[#8c3a26]`;
  });

  protected readonly textoPrevio = computed(() => {
    const anterior = money(this.store.resumen().ingresosAnterior);
    const lista = this.store.meses();
    if (lista.length > 1) return `Periodo previo: ${anterior}`;
    const mes = lista.length ? lista[0] : 0;
    return `${mesNombre(mes > 1 ? mes - 1 : 12)}: ${anterior}`;
  });

  protected readonly rangoGrafico = computed(() => {
    const { labels } = this.store.serie();
    const anio = this.store.filtro().anio;
    return labels.length ? `${labels[0]} — ${labels[labels.length - 1]} ${anio}` : '';
  });

  protected readonly detalleVendidas = computed(
    () => `${integer(this.store.resumen().ventas)} ventas en el periodo`,
  );

  protected readonly detalleRenovacion = computed(
    () => `${integer(this.store.resumen().renovadas)} de ${integer(this.store.resumen().vencen)} renovadas`,
  );

  protected readonly detalleAvisos = computed(
    () => `${integer(this.store.avisos().emitidos)} avisos / ${integer(this.store.avisos().proximas)} próximas a vencer`,
  );

  protected readonly fechaAvisos = computed(() => {
    const fecha = this.store.avisos().fechaCorte;
    if (!fecha) return 'Sin datos de avisos';
    const valor = new Date(fecha);
    return `Al ${valor.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  });

  protected readonly tablaPeriodo = computed(() => {
    const lista = this.store.meses();
    if (!lista.length) return '';
    const plan = this.store.filtro().plan;
    return `${mesNombre(lista[lista.length - 1])} ${this.store.filtro().anio}${plan ? ` · Plan ${etiquetaPlan(plan)}` : ''}`;
  });

  protected readonly cabeceraActual = computed(() => {
    const lista = this.store.meses();
    return lista.length ? `Ingresos ${mesCorto(lista[lista.length - 1]).toLowerCase()}.` : 'Ingresos';
  });

  protected readonly cabeceraPrevia = computed(() => {
    const lista = this.store.meses();
    if (!lista.length) return 'Ingresos';
    const corte = lista[lista.length - 1];
    return `Ingresos ${mesCorto(corte > 1 ? corte - 1 : 12).toLowerCase()}.`;
  });

  protected readonly textoFoco = computed(() => {
    const foco = this.store.foco();
    if (!foco) return 'Sin cohortes con vencimientos en el periodo seleccionado.';
    return (
      `Plan ${etiquetaPlan(foco.plan).toLowerCase()}: ${integer(foco.renovadas)} de ${integer(foco.vencen)} ` +
      `renovaron (${porcentajeTexto(foco.tasa)}). Revisar los motivos de no renovación de esa cohorte.`
    );
  });

  protected readonly promoPeriodo = computed(() => {
    const lista = this.store.meses();
    if (!lista.length) return '';
    return `Promociones con ventas en ${mesNombre(lista[lista.length - 1]).toLowerCase()} de ${this.store.filtro().anio}`;
  });

  protected readonly promoTotal = computed(() =>
    money(this.store.promociones().reduce((total, fila) => total + fila.ingresos, 0)),
  );
}
