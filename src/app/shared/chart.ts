import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  Plugin,
  PointElement,
  Tooltip,
} from 'chart.js';

import { integer, money } from '../core/format';

// Chart.js v4 es modular: hay que registrar lo que se usa.
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Filler, Tooltip);

/** Dibuja el valor encima de cada punto. */
const etiquetasValor: Plugin<'line'> = {
  id: 'etiquetasValor',
  afterDatasetsDraw: (grafico) => {
    const { ctx } = grafico;
    const meta = grafico.getDatasetMeta(0);
    const datos = grafico.data.datasets[0]?.data ?? [];

    ctx.save();
    ctx.fillStyle = '#f4f6f1';
    ctx.font = '600 11px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    meta.data.forEach((punto, indice) => {
      const valor = Number(datos[indice]);
      if (!Number.isFinite(valor)) return;
      ctx.fillText(integer(valor), punto.x, punto.y - 10);
    });
    ctx.restore();
  },
};

const CONFIGURACION: ChartConfiguration<'line', number[], string> = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: '#b9d3be',
        backgroundColor: 'rgba(185, 211, 190, 0.10)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#b9d3be',
        pointBorderColor: '#33493c',
        pointBorderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 26, right: 10, left: 2 } },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#f4f6f1',
        titleColor: '#1f2620',
        bodyColor: '#1f2620',
        displayColors: false,
        padding: 10,
        cornerRadius: 6,
        callbacks: { label: (item) => money(item.parsed.y) },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(244, 246, 241, 0.55)', font: { family: 'Manrope', size: 11 }, maxRotation: 0 },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(244, 246, 241, 0.55)',
          font: { family: 'Manrope', size: 11 },
          maxTicksLimit: 4,
          callback: (valor) => `S/ ${integer(Number(valor))}`,
        },
        grid: { color: 'rgba(244, 246, 241, 0.12)', drawTicks: false },
        border: { display: false },
      },
    },
  },
  plugins: [etiquetasValor],
};

/** Envoltura de Chart.js: crea el gráfico tras el primer render y lo actualiza cuando cambian los datos. */
@Component({
  selector: 'app-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #lienzo></canvas>`,
})
export class ChartCanvas implements OnDestroy {
  readonly labels = input.required<readonly string[]>();
  readonly valores = input.required<readonly number[]>();

  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart<'line', number[], string>;

  constructor() {
    afterNextRender(() => {
      this.grafico = new Chart(this.lienzo().nativeElement, CONFIGURACION);
      this.actualizar();
    });

    effect(() => {
      this.labels();
      this.valores();
      this.actualizar();
    });
  }

  ngOnDestroy(): void {
    this.grafico?.destroy();
  }

  private actualizar(): void {
    if (!this.grafico) return;
    this.grafico.data.labels = [...this.labels()];
    this.grafico.data.datasets[0].data = [...this.valores()];
    this.grafico.update();
  }
}
