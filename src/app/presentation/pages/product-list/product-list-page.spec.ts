/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de la pantalla de listado.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { GetProductsUseCase } from '../../../application/product.use-cases';
import { AppError } from '../../../domain/app-error';
import { Product } from '../../../domain/product';
import { ProductListPage } from './product-list-page';

const make = (n: number): Product => ({
  id: `id-${n}`,
  name: `Producto ${n}`,
  description: 'Descripción del producto',
  logo: '',
  dateRelease: '2025-01-01',
  dateRevision: '2026-01-01',
});

const products = Array.from({ length: 12 }, (_, i) => make(i + 1));

describe('ProductListPage', () => {
  let fixture: ComponentFixture<ProductListPage>;
  const root = () => fixture.nativeElement as HTMLElement;
  const rows = () => root().querySelectorAll('tbody tr');

  const setup = async (execute: () => unknown) => {
    TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [provideRouter([]), { provide: GetProductsUseCase, useValue: { execute } }],
    });
    fixture = TestBed.createComponent(ProductListPage);
    await fixture.whenStable();
  };

  it('muestra el skeleton mientras carga', async () => {
    await setup(() => new Subject<Product[]>());
    expect(root().querySelector('app-table-skeleton')).not.toBeNull();
    expect(root().querySelector('table')).toBeNull();
  });

  it('ofrece un botón Agregar que lleva al formulario de alta', async () => {
    await setup(() => of(products));
    const link = root().querySelector<HTMLAnchorElement>('a.add');
    expect(link?.textContent).toContain('Agregar');
    expect(link?.getAttribute('href')).toBe('/products/new');
  });

  it('muestra 5 filas y el contador al cargar', async () => {
    await setup(() => of(products));
    expect(rows()).toHaveLength(5);
    expect(root().querySelector('.count')?.textContent).toContain('5 Resultados');
  });

  it('muestra el error y permite reintentar', async () => {
    let fail = true;
    await setup(() => (fail ? throwError(() => new AppError('network', 'No se pudo conectar')) : of(products)));
    expect(root().querySelector('[role="alert"]')?.textContent).toContain('No se pudo conectar');

    fail = false;
    root().querySelector<HTMLButtonElement>('.retry')?.click();
    await fixture.whenStable();
    expect(rows()).toHaveLength(5);
  });

  it('filtra al escribir en el buscador', async () => {
    await setup(() => of(products));
    const input = root().querySelector<HTMLInputElement>('.search-input')!;
    input.value = 'Producto 12';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(rows()).toHaveLength(1);
    expect(root().querySelector('.count')?.textContent).toContain('1 Resultados');
  });

  it('muestra el mensaje vacío si la búsqueda no coincide', async () => {
    await setup(() => of(products));
    const input = root().querySelector<HTMLInputElement>('.search-input')!;
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root().querySelector('.empty')).not.toBeNull();
  });

  it('cambia la cantidad de registros con el selector', async () => {
    await setup(() => of(products));
    const select = root().querySelector<HTMLSelectElement>('select')!;
    select.value = '10';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(rows()).toHaveLength(10);
  });

  it('pagina con el botón Siguiente', async () => {
    await setup(() => of(products));
    root().querySelectorAll<HTMLButtonElement>('.pager-btn')[1].click();
    await fixture.whenStable();
    expect(root().querySelector('.pager-info')?.textContent).toContain('Página 2 de 3');
  });
});
