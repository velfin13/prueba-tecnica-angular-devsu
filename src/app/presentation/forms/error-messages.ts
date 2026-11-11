/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Mensajes de error de validación para mostrar bajo cada campo.
 */

import { ValidationErrors } from '@angular/forms';

const REQUIRED_MESSAGE = 'Este campo es requerido!';

/** `requiredMessage` permite que un campo use su propio texto cuando está vacío (el diseño lo pide para el ID). */
export const errorMessage = (errors: ValidationErrors | null, requiredMessage = REQUIRED_MESSAGE): string => {
  if (!errors) {
    return '';
  }
  if (errors['required']) {
    return requiredMessage;
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
