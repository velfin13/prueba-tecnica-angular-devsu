/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de la tabla de productos.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Product } from '../../../domain/product';
import { ProductTable } from './product-table';

const product: Product = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo',
  logo: '',
  dateRelease: '2025-02-01',
  dateRevision: '2026-02-01',
};

describe('ProductTable', () => {
  let fixture: ComponentFixture<ProductTable>;
  const root = () => fixture.nativeElement as HTMLElement;

  const render = async (products: Product[]) => {
    fixture.componentRef.setInput('products', products);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductTable] });
    fixture = TestBed.createComponent(ProductTable);
  });

  it('muestra una fila por producto con fechas formateadas', async () => {
    await render([product, { ...product, id: 'otro', name: 'Otro producto' }]);
    const rows = root().querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Tarjetas de Crédito');
    expect(rows[0].textContent).toContain('01/02/2025');
    expect(rows[0].textContent).toContain('01/02/2026');
  });

  it('muestra un mensaje cuando no hay productos', async () => {
    await render([]);
    expect(root().querySelector('.empty')?.textContent).toContain('No se encontraron productos');
  });

  it('emite edit y remove con el producto de la fila', async () => {
    await render([product]);
    const edited: Product[] = [];
    const removed: Product[] = [];
    fixture.componentInstance.edit.subscribe((p) => edited.push(p));
    fixture.componentInstance.remove.subscribe((p) => removed.push(p));

    root().querySelector<HTMLButtonElement>('.trigger')!.click();
    await fixture.whenStable();
    root().querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[0].click();

    root().querySelector<HTMLButtonElement>('.trigger')!.click();
    await fixture.whenStable();
    root().querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[1].click();

    expect(edited).toEqual([product]);
    expect(removed).toEqual([product]);
  });

  it('incluye las cinco columnas del diseño más la de acciones', async () => {
    await render([product]);
    expect(root().querySelectorAll('thead th')).toHaveLength(6);
  });
});
