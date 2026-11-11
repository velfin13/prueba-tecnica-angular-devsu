/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Mensajes de error de validación para mostrar bajo cada campo.
 */

import { ValidationErrors } from '@angular/forms';

export const errorMessage = (errors: ValidationErrors | null): string => {
  if (!errors) {
    return '';
  }
  if (errors['required']) {
    return 'Este campo es requerido!';
  }
  if (errors['minlength']) {
    return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
  }
  if (errors['maxlength']) {
    return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
  }
  if (errors['idTaken']) {
    return 'ID no válido! Ya existe un producto con ese ID';
  }
  if (errors['dateInPast']) {
    return 'La fecha debe ser igual o mayor a la fecha actual';
  }
  return 'Valor no válido';
};
