import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ProgressBar } from './progress-bar';

/** Tarjeta de métrica: título, valor, subtítulo, detalle, chip opcional y barra opcional. */
@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressBar],
  template: `
    <article class="flex flex-col rounded-[14px] border border-line bg-surface p-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-[13px] font-semibold">{{ titulo() }}</p>
        @if (chip()) {
          <span class="rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-sage">{{ chip() }}</span>
        }
      </div>

      <p
        class="mt-2.5 font-display text-[34px] leading-none tracking-tight tabular-nums"
        [class.animate-pulse]="cargando()"
      >
        {{ valor() }}
      </p>

      <div class="mt-2.5 flex flex-wrap items-baseline justify-between gap-1.5">
        <span class="text-xs text-faint">{{ subtitulo() }}</span>
        <span class="text-xs text-muted">{{ detalle() }}</span>
      </div>

      @if (barra() !== null) {
        <div class="mt-auto pt-3.5"><app-progress-bar [valor]="barra()" /></div>
      }
    </article>
  `,
})
export class KpiCard {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly subtitulo = input('');
  readonly detalle = input('');
  readonly chip = input('');
  readonly barra = input<number | null>(null);
  readonly cargando = input(false);
}
