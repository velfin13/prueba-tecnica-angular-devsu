/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del modal de confirmación.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let opener: HTMLButtonElement;
  const root = () => fixture.nativeElement as HTMLElement;
  const buttons = () => Array.from(root().querySelectorAll<HTMLButtonElement>('.btn'));
  const cancelBtn = () => buttons()[0];
  const confirmBtn = () => buttons()[1];

  const setup = async (inputs: Record<string, unknown> = {}) => {
    opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    TestBed.configureTestingModule({ imports: [ConfirmDialog] });
    fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('message', '¿Estás seguro de eliminar el producto X?');
    Object.entries(inputs).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    await fixture.whenStable();
  };

  afterEach(() => opener.remove());

  it('muestra el mensaje y los botones Cancelar y Eliminar', async () => {
    await setup();
    expect(root().querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
    expect(root().textContent).toContain('¿Estás seguro de eliminar el producto X?');
    expect(cancelBtn().textContent?.trim()).toBe('Cancelar');
    expect(confirmBtn().textContent?.trim()).toBe('Eliminar');
  });

  it('enfoca Cancelar al abrir', async () => {
    await setup();
    expect(document.activeElement).toBe(cancelBtn());
  });

  it('devuelve el foco a quien lo abrió al destruirse', async () => {
    await setup();
    fixture.destroy();
    expect(document.activeElement).toBe(opener);
  });

  it('Cancelar emite cancel', async () => {
    await setup();
    let cancelled = 0;
    fixture.componentInstance.cancel.subscribe(() => cancelled++);
    cancelBtn().click();
    expect(cancelled).toBe(1);
  });

  it('el botón de confirmar emite confirm', async () => {
    await setup();
    let confirmed = 0;
    fixture.componentInstance.confirm.subscribe(() => confirmed++);
    confirmBtn().click();
    expect(confirmed).toBe(1);
  });

  it('Escape cancela', async () => {
    await setup();
    let cancelled = 0;
    fixture.componentInstance.cancel.subscribe(() => cancelled++);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cancelled).toBe(1);
  });

  it('un clic en el fondo cancela, pero uno dentro del diálogo no', async () => {
    await setup();
    let cancelled = 0;
    fixture.componentInstance.cancel.subscribe(() => cancelled++);

    root().querySelector<HTMLElement>('.dialog')!.click();
    expect(cancelled).toBe(0);

    root().querySelector<HTMLElement>('.backdrop')!.click();
    expect(cancelled).toBe(1);
  });

  it('mientras está ocupado deshabilita botones y no se puede cancelar', async () => {
    await setup({ busy: true });
    let cancelled = 0;
    fixture.componentInstance.cancel.subscribe(() => cancelled++);

    expect(cancelBtn().disabled).toBe(true);
    expect(confirmBtn().disabled).toBe(true);
    expect(confirmBtn().textContent).toContain('Eliminando');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    root().querySelector<HTMLElement>('.backdrop')!.click();
    expect(cancelled).toBe(0);
  });

  it('muestra el error si lo hay', async () => {
    await setup({ error: 'No se pudo eliminar' });
    expect(root().querySelector('[role="alert"]')?.textContent).toContain('No se pudo eliminar');
  });

  describe('foco dentro del modal', () => {
    const tab = (shiftKey: boolean) => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
      root().querySelector('.dialog')!.dispatchEvent(event);
      return event;
    };

    it('Tab desde el último botón vuelve al primero', async () => {
      await setup();
      confirmBtn().focus();
      expect(tab(false).defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(cancelBtn());
    });

    it('Shift+Tab desde el primero va al último', async () => {
      await setup();
      cancelBtn().focus();
      expect(tab(true).defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(confirmBtn());
    });

    it('Tab entre botones intermedios no se intercepta', async () => {
      await setup();
      cancelBtn().focus();
      expect(tab(false).defaultPrevented).toBe(false);
    });

    it('ignora otras teclas', async () => {
      await setup();
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      root().querySelector('.dialog')!.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it('sin botones habilitados no hace nada', async () => {
      await setup({ busy: true });
      expect(tab(false).defaultPrevented).toBe(false);
    });
  });
});
