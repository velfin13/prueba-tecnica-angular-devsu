/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de los mensajes de error.
 */

import { errorMessage } from './error-messages';

describe('errorMessage', () => {
  it('devuelve vacío sin errores', () => {
    expect(errorMessage(null)).toBe('');
  });

  it.each([
    [{ required: true }, 'Este campo es requerido!'],
    [{ minlength: { requiredLength: 5, actualLength: 2 } }, 'Mínimo 5 caracteres'],
    [{ maxlength: { requiredLength: 10, actualLength: 20 } }, 'Máximo 10 caracteres'],
    [{ idTaken: true }, 'ID no válido! Ya existe un producto con ese ID'],
    [{ dateInPast: true }, 'La fecha debe ser igual o mayor a la fecha actual'],
    [{ otro: true }, 'Valor no válido'],
  ])('traduce %j', (errors, expected) => {
    expect(errorMessage(errors)).toBe(expected);
  });

  it('usa el texto propio del campo cuando está vacío', () => {
    expect(errorMessage({ required: true }, 'ID no válido!')).toBe('ID no válido!');
  });

  it('el texto propio solo reemplaza al error de requerido', () => {
    expect(errorMessage({ minlength: { requiredLength: 3 } }, 'ID no válido!')).toBe('Mínimo 3 caracteres');
  });

  it('prioriza required sobre los demás errores', () => {
    expect(errorMessage({ required: true, minlength: { requiredLength: 3 } })).toBe('Este campo es requerido!');
  });
});
