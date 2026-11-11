/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Validadores del formulario de productos.
 */

import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { todayIso } from '../../shared/utils/date';

/** Requerido, ignorando espacios en blanco. */
export const requiredTrimmed: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim() ? null : { required: true };

/** La fecha debe ser igual o posterior a hoy. */
export const dateNotInPast: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  return !value || value >= todayIso() ? null : { dateInPast: true };
};

/**
 * Verifica que el ID no exista. Espera `debounceMs` antes de consultar; Angular cancela la
 * validación anterior si el valor cambia. Si la consulta falla no se bloquea el formulario:
 * el backend vuelve a validar el duplicado al guardar.
 */
export const uniqueId =
  (exists: (id: string) => Observable<boolean>, debounceMs = 300): AsyncValidatorFn =>
  (control: AbstractControl): Observable<ValidationErrors | null> =>
    timer(debounceMs).pipe(
      switchMap(() => exists(String(control.value).trim())),
      map((taken) => (taken ? { idTaken: true } : null)),
      catchError(() => of(null)),
    );
