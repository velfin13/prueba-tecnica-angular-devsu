/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del logo de producto.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductLogo } from './product-logo';

describe('ProductLogo', () => {
  let fixture: ComponentFixture<ProductLogo>;
  const root = () => fixture.nativeElement as HTMLElement;

  const render = async (src: string, name: string) => {
    fixture.componentRef.setInput('src', src);
    fixture.componentRef.setInput('name', name);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductLogo] });
    fixture = TestBed.createComponent(ProductLogo);
  });

  it('muestra la imagen cuando hay url', async () => {
    await render('https://x.test/logo.png', 'Tarjeta Crédito');
    expect(root().querySelector('img')?.getAttribute('src')).toBe('https://x.test/logo.png');
  });

  it('muestra las iniciales si no hay url', async () => {
    await render('', 'Tarjeta Crédito');
    expect(root().querySelector('img')).toBeNull();
    expect(root().textContent?.trim()).toBe('TC');
  });

  it('usa una sola inicial con un nombre de una palabra', async () => {
    await render('', 'ahorros');
    expect(root().textContent?.trim()).toBe('A');
  });

  it('cambia a las iniciales si la imagen falla al cargar', async () => {
    await render('https://x.test/roto.png', 'Cuenta Ahorros');
    root().querySelector('img')?.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(root().querySelector('img')).toBeNull();
    expect(root().textContent?.trim()).toBe('CA');
  });

  it('vuelve a intentar con una url nueva tras un fallo', async () => {
    await render('https://x.test/roto.png', 'Cuenta Ahorros');
    root().querySelector('img')?.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    await render('https://x.test/ok.png', 'Cuenta Ahorros');
    expect(root().querySelector('img')).not.toBeNull();
  });
});
