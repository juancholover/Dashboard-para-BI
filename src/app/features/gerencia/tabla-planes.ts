import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { etiquetaPlan } from '../../core/catalogs';
import { integer, money, porcentajeTexto } from '../../core/format';
import { FilaPlan } from '../../core/kpi.models';
import { ProgressBar } from '../../shared/progress-bar';

/** Tabla "Qué ocurre en cada plan". Emite el plan elegido al hacer clic en una fila. */
@Component({
  selector: 'app-tabla-planes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressBar],
  template: `
    <div class="overflow-x-auto border-t border-line">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            @for (titulo of cabeceras(); track titulo) {
              <th class="border-b border-line px-3.5 py-3 text-left text-xs font-medium whitespace-nowrap text-faint">
                {{ titulo }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (fila of filas(); track fila.plan) {
            <tr
              class="cursor-pointer border-b border-line transition-colors hover:bg-sage-soft"
              [class.bg-sage-soft]="planActivo() === fila.plan"
              (click)="filaSeleccionada.emit(fila.plan)"
            >
              <td class="px-3.5 py-3.5 font-semibold whitespace-nowrap">{{ etiquetaPlan(fila.plan) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ money(fila.ingresos) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ money(fila.ingresosAnterior) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ integer(fila.vendidas) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ integer(fila.vencen) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ integer(fila.renovadas) }}</td>
              <td class="px-3.5 py-3.5">
                <span class="flex items-center gap-2.5">
                  <span class="min-w-20 flex-1"><app-progress-bar [valor]="fila.tasa" /></span>
                  <span class="whitespace-nowrap tabular-nums">{{ porcentajeTexto(fila.tasa) }}</span>
                </span>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="7" class="px-3.5 py-7 text-center text-faint">Sin movimientos en el periodo.</td>
            </tr>
          }

          @if (mostrarTotal() && total(); as filaTotal) {
            <tr class="border-b border-line bg-sage-soft/45 font-semibold">
              <td class="px-3.5 py-3.5">Total</td>
              <td class="px-3.5 py-3.5 tabular-nums">{{ money(filaTotal.ingresos) }}</td>
              <td class="px-3.5 py-3.5 tabular-nums">{{ money(filaTotal.ingresosAnterior) }}</td>
              <td class="px-3.5 py-3.5 tabular-nums">{{ integer(filaTotal.vendidas) }}</td>
              <td class="px-3.5 py-3.5 tabular-nums">{{ integer(filaTotal.vencen) }}</td>
              <td class="px-3.5 py-3.5 tabular-nums">{{ integer(filaTotal.renovadas) }}</td>
              <td class="px-3.5 py-3.5">
                <span class="flex items-center gap-2.5">
                  <span class="min-w-20 flex-1"><app-progress-bar [valor]="filaTotal.tasa" /></span>
                  <span class="whitespace-nowrap tabular-nums">{{ porcentajeTexto(filaTotal.tasa) }}</span>
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TablaPlanes {
  readonly filas = input.required<readonly FilaPlan[]>();
  readonly total = input<FilaPlan | null>(null);
  readonly planActivo = input('');
  readonly cabeceraActual = input('Ingresos');
  readonly cabeceraPrevia = input('Ingresos');
  readonly mostrarTotal = input(true);

  readonly filaSeleccionada = output<string>();

  protected readonly money = money;
  protected readonly integer = integer;
  protected readonly porcentajeTexto = porcentajeTexto;
  protected readonly etiquetaPlan = etiquetaPlan;

  protected cabeceras(): string[] {
    return ['Plan', this.cabeceraActual(), this.cabeceraPrevia(), 'Vendidas', 'Vencían', 'Renovadas', 'Tasa de renovación'];
  }
}
