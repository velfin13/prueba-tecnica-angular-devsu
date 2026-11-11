/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de las utilidades de fechas.
 */

import { addOneYear, todayIso } from './date';

describe('todayIso', () => {
  it('devuelve la fecha local con ceros a la izquierda', () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addOneYear', () => {
  it('suma exactamente un año', () => {
    expect(addOneYear('2025-02-01')).toBe('2026-02-01');
  });

  it('ajusta el 29 de febrero cuando el año siguiente no es bisiesto', () => {
    expect(addOneYear('2024-02-29')).toBe('2025-02-28');
  });

  it('mantiene el 29 de febrero si el año siguiente es bisiesto', () => {
    expect(addOneYear('2027-02-28')).toBe('2028-02-28');
  });

  it('devuelve vacío si la fecha no es válida', () => {
    expect(addOneYear('')).toBe('');
    expect(addOneYear('01/02/2025')).toBe('');
  });
});
