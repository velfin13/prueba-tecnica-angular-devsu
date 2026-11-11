/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de la pantalla de alta de producto.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CheckProductIdUseCase, CreateProductUseCase } from '../../../application/product.use-cases';
import { AppError } from '../../../domain/app-error';
import { Product } from '../../../domain/product';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductCreatePage } from './product-create-page';

const product: Product = {
  id: 'abc',
  name: 'Producto prueba',
  description: 'Descripción de prueba',
  logo: 'logo.png',
  dateRelease: '2099-01-01',
  dateRevision: '2100-01-01',
};

describe('ProductCreatePage', () => {
  let fixture: ComponentFixture<ProductCreatePage>;
  const navigate = vi.fn();
  const formEl = () => fixture.nativeElement.querySelector('app-product-form') as HTMLElement;
  const formComponent = () => fixture.debugElement.children[0].componentInstance as ProductForm;

  const setup = async (execute: () => unknown) => {
    TestBed.configureTestingModule({
      imports: [ProductCreatePage],
      providers: [
        { provide: CreateProductUseCase, useValue: { execute } },
        { provide: CheckProductIdUseCase, useValue: { execute: () => of(false) } },
        { provide: Router, useValue: { navigateByUrl: navigate } },
      ],
    });
    fixture = TestBed.createComponent(ProductCreatePage);
    await fixture.whenStable();
  };

  beforeEach(() => navigate.mockClear());

  it('muestra el formulario de registro', async () => {
    await setup(() => new Subject());
    expect(formEl()).not.toBeNull();
    expect(formEl().textContent).toContain('Formulario de Registro');
  });

  it('vuelve al listado al guardar con éxito', async () => {
    const result = new Subject<Product>();
    await setup(() => result);

    formComponent().save.emit(product);
    result.next(product);
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('muestra el error del servidor y se queda en el formulario', async () => {
    await setup(() => throwError(() => new AppError('duplicate', 'Ya existe un producto con ese ID.')));

    formComponent().save.emit(product);
    await fixture.whenStable();

    expect(navigate).not.toHaveBeenCalled();
    expect(formEl().querySelector('.submit-error')?.textContent).toContain('Ya existe un producto');
  });
});
