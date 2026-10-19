import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MESES } from '../core/catalogs';
import { FiltroGerencia } from '../core/kpi.models';

/** Filtros del panel: año, trimestre, mes y plan. El componente no conoce el store: emite cambios. */
@Component({
  selector: 'app-filter-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-7 flex flex-wrap items-center gap-3">
      <label class="inline-flex items-center gap-2 rounded-[10px] border border-line bg-surface py-1.5 pl-3 pr-2">
        <span class="text-xs text-faint">Año</span>
        <select id="filtroAnio" name="anio" class="cursor-pointer rounded-md border-0 bg-transparent p-1 text-sm font-medium" [value]="filtro().anio" (change)="cambiarAnio($event)">
          @for (anio of anios(); track anio) {
            <option [value]="anio">{{ anio }}</option>
          }
        </select>
      </label>

      <label class="inline-flex items-center gap-2 rounded-[10px] border border-line bg-surface py-1.5 pl-3 pr-2">
        <span class="text-xs text-faint">Trimestre</span>
        <select id="filtroTrimestre" name="trimestre" class="cursor-pointer rounded-md border-0 bg-transparent p-1 text-sm font-medium" [value]="filtro().trimestre" (change)="cambiarTrimestre($event)">
          <option value="0">Todos</option>
          <option value="1">Q1</option>
          <option value="2">Q2</option>
          <option value="3">Q3</option>
          <option value="4">Q4</option>
        </select>
      </label>

      <label class="inline-flex items-center gap-2 rounded-[10px] border border-line bg-surface py-1.5 pl-3 pr-2">
        <span class="text-xs text-faint">Mes</span>
        <select id="filtroMes" name="mes" class="cursor-pointer rounded-md border-0 bg-transparent p-1 text-sm font-medium" [value]="filtro().mes" (change)="cambiarMes($event)">
          <option value="0">Todos</option>
          @for (mes of meses; track mes.n) {
            <option [value]="mes.n">{{ mes.nombre }}</option>
          }
        </select>
      </label>

      <label class="inline-flex items-center gap-2 rounded-[10px] border border-line bg-surface py-1.5 pl-3 pr-2">
        <span class="text-xs text-faint">Plan</span>
        <select id="filtroPlan" name="plan" class="cursor-pointer rounded-md border-0 bg-transparent p-1 text-sm font-medium" [value]="filtro().plan" (change)="cambiarPlan($event)">
          <option value="">Todos</option>
          @for (plan of planes(); track plan.valor) {
            <option [value]="plan.valor">{{ plan.etiqueta }}</option>
          }
        </select>
      </label>

      <p class="text-xs text-faint">
        El plan filtra la tabla por plan. La retención y la renovación son de toda la sede.
      </p>
    </div>
  `,
})
export class FilterBar {
  readonly anios = input.required<readonly number[]>();
  readonly planes = input.required<readonly { valor: string; etiqueta: string }[]>();
  readonly filtro = input.required<FiltroGerencia>();

  readonly anioCambia = output<number>();
  readonly trimestreCambia = output<number>();
  readonly mesCambia = output<number>();
  readonly planCambia = output<string>();

  protected readonly meses = MESES;

  protected cambiarAnio(evento: Event): void {
    this.anioCambia.emit(Number((evento.target as HTMLSelectElement).value));
  }

  protected cambiarTrimestre(evento: Event): void {
    this.trimestreCambia.emit(Number((evento.target as HTMLSelectElement).value));
  }

  protected cambiarMes(evento: Event): void {
    this.mesCambia.emit(Number((evento.target as HTMLSelectElement).value));
  }

  protected cambiarPlan(evento: Event): void {
    this.planCambia.emit((evento.target as HTMLSelectElement).value);
  }
}
