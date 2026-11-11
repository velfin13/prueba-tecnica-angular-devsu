/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del store del listado.
 */

import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { GetProductsUseCase } from '../../../application/product.use-cases';
import { AppError } from '../../../domain/app-error';
import { Product } from '../../../domain/product';
import { ProductListStore } from './product-list.store';

const make = (n: number): Product => ({
  id: `id-${n}`,
  name: `Producto ${n}`,
  description: 'Descripción del producto',
  logo: '',
  dateRelease: '2025-01-01',
  dateRevision: '2026-01-01',
});

const products = Array.from({ length: 12 }, (_, i) => make(i + 1));

describe('ProductListStore', () => {
  const setup = (execute: () => unknown) => {
    TestBed.configureTestingModule({
      providers: [ProductListStore, { provide: GetProductsUseCase, useValue: { execute } }],
    });
    return TestBed.inject(ProductListStore);
  };

  it('arranca en estado loading y pasa a ready al cargar', () => {
    const pending = new Subject<Product[]>();
    const store = setup(() => pending);

    store.load();
    expect(store.status()).toBe('loading');

    pending.next(products);
    expect(store.status()).toBe('ready');
    expect(store.page().totalItems).toBe(12);
  });

  it('pasa a error con el mensaje del AppError', () => {
    const store = setup(() => throwError(() => new AppError('network', 'Sin conexión')));
    store.load();
    expect(store.status()).toBe('error');
    expect(store.errorMessage()).toBe('Sin conexión');
  });

  it('muestra 5 registros por defecto', () => {
    const store = setup(() => of(products));
    store.load();
    expect(store.page().items).toHaveLength(5);
    expect(store.page().totalPages).toBe(3);
  });

  it('cambia el tamaño de página y vuelve a la primera', () => {
    const store = setup(() => of(products));
    store.load();
    store.goToPage(3);
    store.setPageSize(10);
    expect(store.page().page).toBe(1);
    expect(store.page().items).toHaveLength(10);
  });

  it('filtra por texto y vuelve a la primera página', () => {
    const store = setup(() => of(products));
    store.load();
    store.goToPage(3);
    store.setSearch('Producto 12');
    expect(store.page().page).toBe(1);
    expect(store.page().items.map((p) => p.id)).toEqual(['id-12']);
  });

  it('navega entre páginas', () => {
    const store = setup(() => of(products));
    store.load();
    store.goToPage(3);
    expect(store.page().items.map((p) => p.id)).toEqual(['id-11', 'id-12']);
  });

  it('reintenta la carga tras un error', () => {
    let fail = true;
    const store = setup(() => (fail ? throwError(() => new AppError('network', 'x')) : of(products)));
    store.load();
    expect(store.status()).toBe('error');

    fail = false;
    store.load();
    expect(store.status()).toBe('ready');
  });
});
