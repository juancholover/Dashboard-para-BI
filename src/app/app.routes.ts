import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'gerencia' },
  {
    path: 'gerencia',
    loadComponent: () => import('./features/gerencia/gerencia-page').then((m) => m.GerenciaPage),
  },
  { path: '**', redirectTo: 'gerencia' },
];
