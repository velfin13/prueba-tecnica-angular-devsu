/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del formateo de fechas.
 */

import { formatDate } from './format-date';

describe('formatDate', () => {
  it('convierte YYYY-MM-DD a DD/MM/YYYY', () => {
    expect(formatDate('2025-02-01')).toBe('01/02/2025');
  });

  it('acepta fechas ISO completas', () => {
    expect(formatDate('2025-02-01T00:00:00.000Z')).toBe('01/02/2025');
  });

  it('devuelve el valor original si no tiene el formato esperado', () => {
    expect(formatDate('abc')).toBe('abc');
  });
});
