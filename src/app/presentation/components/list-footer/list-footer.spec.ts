/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del pie de la tabla.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListFooter } from './list-footer';

describe('ListFooter', () => {
  let fixture: ComponentFixture<ListFooter>;
  const root = () => fixture.nativeElement as HTMLElement;
  const buttons = () => Array.from(root().querySelectorAll<HTMLButtonElement>('.pager-btn'));

  const render = async (page: number, totalPages: number) => {
    fixture.componentRef.setInput('shown', 5);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.componentRef.setInput('pageSize', 5);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ListFooter] });
    fixture = TestBed.createComponent(ListFooter);
  });

  it('muestra la cantidad de resultados y la página actual', async () => {
    await render(2, 4);
    expect(root().querySelector('.count')?.textContent).toContain('5 Resultados');
    expect(root().querySelector('.pager-info')?.textContent).toContain('Página 2 de 4');
  });

  it('ofrece las opciones 5, 10 y 20', async () => {
    await render(1, 1);
    const options = Array.from(root().querySelectorAll('option')).map((o) => o.textContent?.trim());
    expect(options).toEqual(['5', '10', '20']);
  });

  it('deshabilita Anterior en la primera página y Siguiente en la última', async () => {
    await render(1, 3);
    expect(buttons()[0].disabled).toBe(true);
    expect(buttons()[1].disabled).toBe(false);

    await render(3, 3);
    expect(buttons()[0].disabled).toBe(false);
    expect(buttons()[1].disabled).toBe(true);
  });

  it('emite la página destino al navegar', async () => {
    await render(2, 3);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emitted.push(p));
    buttons()[0].click();
    buttons()[1].click();
    expect(emitted).toEqual([1, 3]);
  });

  it('emite el nuevo tamaño al cambiar el selector', async () => {
    await render(1, 1);
    const emitted: number[] = [];
    fixture.componentInstance.pageSizeChange.subscribe((s) => emitted.push(s));
    const select = root().querySelector('select') as HTMLSelectElement;
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    expect(emitted).toEqual([20]);
  });
});
