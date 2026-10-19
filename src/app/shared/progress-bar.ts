import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { anchoBarra } from '../core/format';

/** Barra de progreso de 4px (pista salvia clara, relleno salvia). */
@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="block h-1 rounded-full bg-sage-soft">
      <span
        class="block h-1 rounded-full bg-sage transition-[width] duration-500 ease-out"
        [style.width.%]="ancho()"
      ></span>
    </span>
  `,
})
export class ProgressBar {
  readonly valor = input<number | null>(null);
  protected readonly ancho = computed(() => anchoBarra(this.valor()));
}
