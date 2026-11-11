/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de la pantalla de listado.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { DeleteProductUseCase, GetProductsUseCase } from '../../../application/product.use-cases';
import { AppError } from '../../../domain/app-error';
import { Product } from '../../../domain/product';
import { SEARCH_DEBOUNCE_MS } from './product-list.store';
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
  const typeInSearch = async (text: string) => {
    const input = root().querySelector<HTMLInputElement>('.search-input')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50));
    await fixture.whenStable();
  };

  const setup = async (execute: () => unknown, remove: (id: string) => unknown = () => of(undefined)) => {
    TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [
        provideRouter([]),
        { provide: GetProductsUseCase, useValue: { execute } },
        { provide: DeleteProductUseCase, useValue: { execute: remove } },
      ],
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
    await typeInSearch('Producto 12');
    expect(rows()).toHaveLength(1);
    expect(root().querySelector('.count')?.textContent).toContain('1 Resultados');
  });

  it('muestra el mensaje vacío si la búsqueda no coincide', async () => {
    await setup(() => of(products));
    await typeInSearch('zzz');
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

  describe('menú contextual', () => {
    const openMenu = async (row = 0) => {
      root().querySelectorAll<HTMLButtonElement>('.trigger')[row].click();
      await fixture.whenStable();
    };
    const clickItem = async (label: string) => {
      const item = Array.from(root().querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
        (button) => button.textContent?.trim() === label,
      )!;
      item.click();
      await fixture.whenStable();
    };
    const dialog = () => root().querySelector('[role="dialog"]');

    it('Editar navega a la pantalla de edición del producto', async () => {
      await setup(() => of(products));
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      await openMenu(1);
      await clickItem('Editar');

      expect(navigate).toHaveBeenCalledWith(['/products', 'id-2', 'edit']);
    });

    it('Eliminar abre el modal con el nombre del producto', async () => {
      await setup(() => of(products));
      await openMenu(0);
      await clickItem('Eliminar');

      expect(dialog()?.textContent).toContain('¿Estás seguro de eliminar el producto Producto 1?');
    });

    it('Cancelar cierra el modal sin eliminar', async () => {
      const remove = vi.fn(() => of(undefined));
      await setup(() => of(products), remove);
      await openMenu(0);
      await clickItem('Eliminar');

      dialog()!.querySelector<HTMLButtonElement>('.btn-secondary')!.click();
      await fixture.whenStable();

      expect(dialog()).toBeNull();
      expect(remove).not.toHaveBeenCalled();
      expect(rows()).toHaveLength(5);
    });

    it('Eliminar en el modal borra el producto de la tabla', async () => {
      const remove = vi.fn(() => of(undefined));
      await setup(() => of(products), remove);
      await openMenu(0);
      await clickItem('Eliminar');

      dialog()!.querySelector<HTMLButtonElement>('.btn-primary')!.click();
      await fixture.whenStable();

      expect(remove).toHaveBeenCalledWith('id-1');
      expect(dialog()).toBeNull();
      expect(root().textContent).not.toContain('Producto 1 ');
      expect(rows()[0].textContent).toContain('Producto 2');
    });

    it('muestra el error dentro del modal si la eliminación falla', async () => {
      await setup(
        () => of(products),
        () => throwError(() => new AppError('network', 'No se pudo conectar con el servidor.')),
      );
      await openMenu(0);
      await clickItem('Eliminar');

      dialog()!.querySelector<HTMLButtonElement>('.btn-primary')!.click();
      await fixture.whenStable();

      expect(dialog()?.textContent).toContain('No se pudo conectar con el servidor.');
      expect(rows()).toHaveLength(5);
    });
  });
});
