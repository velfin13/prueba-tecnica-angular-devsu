/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Conversión de errores HTTP a errores de aplicación con mensajes para el usuario.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from '../domain/app-error';

export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  if (!(error instanceof HttpErrorResponse)) {
    return new AppError('unknown', 'Ocurrió un error inesperado. Intenta nuevamente.');
  }
  switch (error.status) {
    case 0:
      return new AppError('network', 'No se pudo conectar con el servidor. Verifica tu conexión.');
    case 404:
      return new AppError('not-found', 'No se encontró el producto solicitado.');
    case 400:
      return error.error?.message?.startsWith('Duplicate')
        ? new AppError('duplicate', 'Ya existe un producto con ese ID.')
        : new AppError('validation', 'Los datos enviados no son válidos. Revisa el formulario.');
    default:
      return new AppError('unknown', 'El servidor tuvo un problema. Intenta nuevamente más tarde.');
  }
};
