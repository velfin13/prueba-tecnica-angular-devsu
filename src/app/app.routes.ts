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
  {
    path: 'products/new',
    loadComponent: () =>
      import('./presentation/pages/product-create/product-create-page').then((m) => m.ProductCreatePage),
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./presentation/pages/product-edit/product-edit-page').then((m) => m.ProductEditPage),
  },
  { path: '**', redirectTo: '' },
];
