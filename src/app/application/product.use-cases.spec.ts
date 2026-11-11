/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de los casos de uso de productos.
 */

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppError } from '../domain/app-error';
import { Product } from '../domain/product';
import { ProductRepository } from '../domain/product.repository';
import {
  CheckProductIdUseCase,
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByIdUseCase,
  GetProductsUseCase,
  UpdateProductUseCase,
} from './product.use-cases';

const product: Product = {
  id: 'abc',
  name: 'Producto prueba',
  description: 'Descripción de prueba',
  logo: 'logo.png',
  dateRelease: '2025-01-01',
  dateRevision: '2026-01-01',
};

describe('Casos de uso de producto', () => {
  const repository = {
    getAll: vi.fn(() => of([product])),
    create: vi.fn(() => of(product)),
    update: vi.fn(() => of(product)),
    delete: vi.fn(() => of(undefined)),
    idExists: vi.fn(() => of(true)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: ProductRepository, useValue: repository }],
    });
  });

  it('GetProductsUseCase delega en el repositorio', () => {
    let result: Product[] = [];
    TestBed.inject(GetProductsUseCase).execute().subscribe((r) => (result = r));
    expect(result).toEqual([product]);
    expect(repository.getAll).toHaveBeenCalledOnce();
  });

  it('GetProductByIdUseCase devuelve el producto con ese id', () => {
    let result: Product | undefined;
    TestBed.inject(GetProductByIdUseCase).execute('abc').subscribe((r) => (result = r));
    expect(result).toEqual(product);
  });

  it('GetProductByIdUseCase falla con not-found si el id no existe', () => {
    let error: AppError | undefined;
    TestBed.inject(GetProductByIdUseCase).execute('zzz').subscribe({ error: (e) => (error = e) });
    expect(error?.kind).toBe('not-found');
  });

  it('CreateProductUseCase delega en el repositorio', () => {
    TestBed.inject(CreateProductUseCase).execute(product).subscribe();
    expect(repository.create).toHaveBeenCalledWith(product);
  });

  it('UpdateProductUseCase delega en el repositorio', () => {
    TestBed.inject(UpdateProductUseCase).execute(product).subscribe();
    expect(repository.update).toHaveBeenCalledWith(product);
  });

  it('DeleteProductUseCase delega en el repositorio', () => {
    TestBed.inject(DeleteProductUseCase).execute('abc').subscribe();
    expect(repository.delete).toHaveBeenCalledWith('abc');
  });

  it('CheckProductIdUseCase delega en el repositorio', () => {
    let exists = false;
    TestBed.inject(CheckProductIdUseCase).execute('abc').subscribe((r) => (exists = r));
    expect(exists).toBe(true);
    expect(repository.idExists).toHaveBeenCalledWith('abc');
  });
});
