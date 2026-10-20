import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { integer, money } from '../../core/format';
import { FilaPromocion } from '../../core/kpi.models';

/** Tabla "Ventas por promoción" (mismo lenguaje visual que la tabla por plan). */
@Component({
  selector: 'app-tabla-promociones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-x-auto border-t border-line">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            @for (titulo of cabeceras; track titulo) {
              <th class="border-b border-line px-3.5 py-3 text-left text-xs font-medium whitespace-nowrap text-faint">
                {{ titulo }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (fila of filas(); track fila.promocion) {
            <tr class="border-b border-line">
              <td class="px-3.5 py-3.5 font-semibold">{{ fila.promocion }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ money(fila.ingresos) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ integer(fila.ventas) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ money(fila.descuento) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ integer(fila.membresiasVendidas) }}</td>
              <td class="px-3.5 py-3.5 whitespace-nowrap tabular-nums">{{ integer(fila.membresiasRenovadas) }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="px-3.5 py-7 text-center text-faint">Sin ventas con promoción en el periodo.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TablaPromociones {
  readonly filas = input.required<readonly FilaPromocion[]>();

  protected readonly money = money;
  protected readonly integer = integer;
  protected readonly cabeceras = ['Promoción', 'Ingresos', 'Ventas', 'Descuento', 'Membresías', 'Renovadas'];
}
