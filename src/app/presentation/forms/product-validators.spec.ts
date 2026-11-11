/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de los validadores del formulario.
 */

import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { dateNotInPast, requiredTrimmed, uniqueId } from './product-validators';

describe('requiredTrimmed', () => {
  it.each(['', '   ', null])('falla con %j', (value) => {
    expect(requiredTrimmed(new FormControl(value))).toEqual({ required: true });
  });

  it('pasa con texto', () => {
    expect(requiredTrimmed(new FormControl(' a '))).toBeNull();
  });
});

describe('dateNotInPast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 10, 12));
  });
  afterEach(() => vi.useRealTimers());

  it('acepta hoy', () => {
    expect(dateNotInPast(new FormControl('2026-11-10'))).toBeNull();
  });

  it('acepta una fecha futura', () => {
    expect(dateNotInPast(new FormControl('2027-01-01'))).toBeNull();
  });

  it('rechaza una fecha pasada', () => {
    expect(dateNotInPast(new FormControl('2026-11-09'))).toEqual({ dateInPast: true });
  });

  it('deja el vacío al validador required', () => {
    expect(dateNotInPast(new FormControl(''))).toBeNull();
  });
});

describe('uniqueId', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const validate = (exists: (id: string) => Observable<boolean>, value = ' abc ') => {
    const results: (ValidationErrors | null)[] = [];
    const result$ = uniqueId(exists)(new FormControl(value)) as Observable<ValidationErrors | null>;
    result$.subscribe((result) => results.push(result));
    return results;
  };

  it('devuelve idTaken si el ID ya existe', async () => {
    const results = validate(() => of(true));
    await vi.advanceTimersByTimeAsync(300);
    expect(results).toEqual([{ idTaken: true }]);
  });

  it('devuelve null si el ID está libre', async () => {
    const results = validate(() => of(false));
    await vi.advanceTimersByTimeAsync(300);
    expect(results).toEqual([null]);
  });

  it('consulta el ID sin espacios', async () => {
    const exists = vi.fn(() => of(false));
    validate(exists);
    await vi.advanceTimersByTimeAsync(300);
    expect(exists).toHaveBeenCalledWith('abc');
  });

  it('no consulta antes de que pase el debounce', async () => {
    const exists = vi.fn(() => of(false));
    validate(exists);
    await vi.advanceTimersByTimeAsync(299);
    expect(exists).not.toHaveBeenCalled();
  });

  it('no bloquea el formulario si la consulta falla', async () => {
    const results = validate(() => throwError(() => new Error('x')));
    await vi.advanceTimersByTimeAsync(300);
    expect(results).toEqual([null]);
  });
});
