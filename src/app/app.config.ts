/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Configuración de proveedores de la aplicación: enrutamiento, cliente HTTP y repositorio de productos.
 */

import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ProductRepository } from './domain/product.repository';
import { HttpProductRepository } from './infrastructure/http-product.repository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    // Enlaza la abstracción del repositorio con su implementación HTTP.
    { provide: ProductRepository, useClass: HttpProductRepository },
  ],
};
