/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del store del listado.
 */

import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { DeleteProductUseCase, GetProductsUseCase } from '../../../application/product.use-cases';
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
  const setup = (execute: () => unknown, remove: (id: string) => unknown = () => of(undefined)) => {
    TestBed.configureTestingModule({
      providers: [
        ProductListStore,
        { provide: GetProductsUseCase, useValue: { execute } },
        { provide: DeleteProductUseCase, useValue: { execute: remove } },
      ],
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

  describe('eliminar', () => {
    it('requestDelete abre la confirmación y cancelDelete la cierra sin borrar', () => {
      const remove = vi.fn(() => of(undefined));
      const store = setup(() => of(products), remove);
      store.load();

      store.requestDelete(products[0]);
      expect(store.pendingDelete()).toBe(products[0]);

      store.cancelDelete();
      expect(store.pendingDelete()).toBeNull();
      expect(remove).not.toHaveBeenCalled();
      expect(store.page().totalItems).toBe(12);
    });

    it('confirmDelete elimina el producto de la lista y cierra la confirmación', () => {
      const remove = vi.fn(() => of(undefined));
      const store = setup(() => of(products), remove);
      store.load();

      store.requestDelete(products[0]);
      store.confirmDelete();

      expect(remove).toHaveBeenCalledWith('id-1');
      expect(store.page().totalItems).toBe(11);
      expect(store.page().items.map((p) => p.id)).not.toContain('id-1');
      expect(store.pendingDelete()).toBeNull();
      expect(store.deleting()).toBe(false);
    });

    it('si falla, mantiene la confirmación abierta con el mensaje de error', () => {
      const store = setup(
        () => of(products),
        () => throwError(() => new AppError('not-found', 'No se encontró el producto solicitado.')),
      );
      store.load();

      store.requestDelete(products[0]);
      store.confirmDelete();

      expect(store.deleteError()).toBe('No se encontró el producto solicitado.');
      expect(store.pendingDelete()).toBe(products[0]);
      expect(store.deleting()).toBe(false);
      expect(store.page().totalItems).toBe(12);
    });

    it('requestDelete limpia un error anterior', () => {
      const store = setup(
        () => of(products),
        () => throwError(() => new AppError('unknown', 'x')),
      );
      store.load();
      store.requestDelete(products[0]);
      store.confirmDelete();
      store.cancelDelete();

      store.requestDelete(products[1]);
      expect(store.deleteError()).toBe('');
    });

    it('no permite cancelar ni confirmar de nuevo mientras elimina', () => {
      const pending = new Subject<void>();
      const remove = vi.fn(() => pending);
      const store = setup(() => of(products), remove);
      store.load();

      store.requestDelete(products[0]);
      store.confirmDelete();
      store.confirmDelete();
      store.cancelDelete();

      expect(remove).toHaveBeenCalledOnce();
      expect(store.pendingDelete()).toBe(products[0]);
      expect(store.deleting()).toBe(true);
    });

    it('confirmDelete sin producto pendiente no hace nada', () => {
      const remove = vi.fn(() => of(undefined));
      const store = setup(() => of(products), remove);
      store.load();
      store.confirmDelete();
      expect(remove).not.toHaveBeenCalled();
    });
  });
});
