/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de la pantalla de edición de producto.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import {
  CheckProductIdUseCase,
  GetProductByIdUseCase,
  UpdateProductUseCase,
} from '../../../application/product.use-cases';
import { AppError } from '../../../domain/app-error';
import { Product } from '../../../domain/product';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductEditPage } from './product-edit-page';

const product: Product = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo crédito',
  logo: 'logo.png',
  dateRelease: '2099-03-15',
  dateRevision: '2100-03-15',
};

describe('ProductEditPage', () => {
  let fixture: ComponentFixture<ProductEditPage>;
  const root = () => fixture.nativeElement as HTMLElement;
  const navigate = vi.fn();

  const setup = async (get: () => unknown, update: () => unknown = () => of(product)) => {
    TestBed.configureTestingModule({
      imports: [ProductEditPage],
      providers: [
        provideRouter([]),
        { provide: GetProductByIdUseCase, useValue: { execute: get } },
        { provide: UpdateProductUseCase, useValue: { execute: update } },
        { provide: CheckProductIdUseCase, useValue: { execute: () => of(false) } },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockImplementation(navigate);
    fixture = TestBed.createComponent(ProductEditPage);
    fixture.componentRef.setInput('id', 'trj-crd');
    await fixture.whenStable();
  };

  beforeEach(() => navigate.mockReset());

  it('muestra "Cargando" mientras obtiene el producto', async () => {
    await setup(() => new Subject());
    expect(root().querySelector('[role="status"]')?.textContent).toContain('Cargando producto');
  });

  it('carga el producto por el id de la ruta y muestra el formulario con el ID deshabilitado', async () => {
    const get = vi.fn(() => of(product));
    await setup(get);

    expect(get).toHaveBeenCalledWith('trj-crd');
    expect(root().querySelector('h1')?.textContent).toContain('Formulario de Edición');
    const id = root().querySelector<HTMLInputElement>('#pf-id')!;
    expect(id.value).toBe('trj-crd');
    expect(id.disabled).toBe(true);
  });

  it('muestra el error si el producto no existe y permite volver o reintentar', async () => {
    await setup(() => throwError(() => new AppError('not-found', 'No se encontró el producto solicitado.')));
    const alert = root().querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('No se encontró el producto solicitado.');
    expect(alert.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(alert.querySelector('button')?.textContent).toContain('Reintentar');
  });

  it('Reintentar vuelve a cargar', async () => {
    let fail = true;
    await setup(() => (fail ? throwError(() => new AppError('network', 'Sin conexión')) : of(product)));

    fail = false;
    root().querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await fixture.whenStable();

    expect(root().querySelector('app-product-form')).not.toBeNull();
  });

  it('al guardar actualiza y vuelve al listado', async () => {
    const update = vi.fn(() => of(product));
    await setup(() => of(product), update);

    const form = fixture.debugElement.query((d) => d.name === 'app-product-form').componentInstance as ProductForm;
    form.save.emit(product);
    await fixture.whenStable();

    expect(update).toHaveBeenCalledWith(product);
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('muestra el error del servidor al guardar y no navega', async () => {
    await setup(
      () => of(product),
      () => throwError(() => new AppError('not-found', 'No se encontró el producto solicitado.')),
    );

    const form = fixture.debugElement.query((d) => d.name === 'app-product-form').componentInstance as ProductForm;
    form.save.emit(product);
    await fixture.whenStable();

    expect(navigate).not.toHaveBeenCalled();
    expect(root().querySelector('.submit-error')?.textContent).toContain('No se encontró');
  });
});
