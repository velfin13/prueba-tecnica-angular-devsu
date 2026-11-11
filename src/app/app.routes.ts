/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Definición de rutas de la aplicación.
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./presentation/pages/product-list/product-list-page').then((m) => m.ProductListPage),
  },
  { path: '**', redirectTo: '' },
];
