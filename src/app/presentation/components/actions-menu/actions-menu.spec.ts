/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del menú contextual.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionsMenu } from './actions-menu';

describe('ActionsMenu', () => {
  let fixture: ComponentFixture<ActionsMenu>;
  const root = () => fixture.nativeElement as HTMLElement;
  const trigger = () => root().querySelector<HTMLButtonElement>('.trigger')!;
  const menu = () => root().querySelector('[role="menu"]');
  const items = () => Array.from(root().querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));

  const open = async () => {
    trigger().click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ActionsMenu] });
    fixture = TestBed.createComponent(ActionsMenu);
    await fixture.whenStable();
  });

  it('empieza cerrado', () => {
    expect(menu()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('se abre al pulsar el botón con Editar y Eliminar', async () => {
    await open();
    expect(menu()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(items().map((i) => i.textContent?.trim())).toEqual(['Editar', 'Eliminar']);
  });

  it('enfoca la primera opción al abrir', async () => {
    await open();
    expect(document.activeElement).toBe(items()[0]);
  });

  it('se cierra al pulsar de nuevo el botón', async () => {
    await open();
    await open();
    expect(menu()).toBeNull();
  });

  it('se cierra con Escape y devuelve el foco al botón', async () => {
    await open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('se cierra al hacer clic fuera', async () => {
    await open();
    document.body.click();
    await fixture.whenStable();
    expect(menu()).toBeNull();
  });

  it('no se cierra al hacer clic dentro del menú sin elegir', async () => {
    await open();
    menu()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(menu()).not.toBeNull();
  });

  it('se cierra al hacer scroll', async () => {
    await open();
    document.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(menu()).toBeNull();
  });

  it('Editar emite edit y cierra el menú', async () => {
    let edited = 0;
    fixture.componentInstance.edit.subscribe(() => edited++);
    await open();
    items()[0].click();
    await fixture.whenStable();
    expect(edited).toBe(1);
    expect(menu()).toBeNull();
  });

  it('Eliminar emite remove y cierra el menú', async () => {
    let removed = 0;
    fixture.componentInstance.remove.subscribe(() => removed++);
    await open();
    items()[1].click();
    await fixture.whenStable();
    expect(removed).toBe(1);
    expect(menu()).toBeNull();
  });

  it('las flechas recorren las opciones de forma circular', async () => {
    await open();
    const press = (key: string) => menu()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    press('ArrowDown');
    expect(document.activeElement).toBe(items()[1]);
    press('ArrowDown');
    expect(document.activeElement).toBe(items()[0]);
    press('ArrowUp');
    expect(document.activeElement).toBe(items()[1]);
  });

  it('ignora otras teclas', async () => {
    await open();
    menu()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(document.activeElement).toBe(items()[0]);
  });

  it('usa la etiqueta accesible indicada', async () => {
    fixture.componentRef.setInput('label', 'Acciones de Tarjeta');
    await fixture.whenStable();
    expect(trigger().getAttribute('aria-label')).toBe('Acciones de Tarjeta');
  });
});
