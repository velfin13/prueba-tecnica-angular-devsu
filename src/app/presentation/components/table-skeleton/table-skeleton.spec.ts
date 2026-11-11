/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del skeleton de carga.
 */

import { TestBed } from '@angular/core/testing';
import { TableSkeleton } from './table-skeleton';

describe('TableSkeleton', () => {
  it('renderiza 5 filas por defecto', async () => {
    const fixture = TestBed.createComponent(TableSkeleton);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.row')).toHaveLength(5);
  });

  it('respeta el número de filas indicado', async () => {
    const fixture = TestBed.createComponent(TableSkeleton);
    fixture.componentRef.setInput('rows', 3);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.row')).toHaveLength(3);
  });
});
