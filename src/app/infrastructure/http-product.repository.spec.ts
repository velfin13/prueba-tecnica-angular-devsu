/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del repositorio HTTP de productos.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppError } from '../domain/app-error';
import { Product } from '../domain/product';
import { HttpProductRepository } from './http-product.repository';

const product: Product = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'assets-1.png',
  dateRelease: '2025-01-01',
  dateRevision: '2026-01-01',
};

const apiProduct = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'assets-1.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

describe('HttpProductRepository', () => {
  let repository: HttpProductRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpProductRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HttpProductRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll mapea la lista al dominio', () => {
    let result: Product[] = [];
    repository.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/bp/products');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [apiProduct] });

    expect(result).toEqual([product]);
  });

  it('getAll traduce un error de red a AppError', () => {
    let error: AppError | undefined;
    repository.getAll().subscribe({ error: (e) => (error = e) });

    httpMock.expectOne('/bp/products').error(new ProgressEvent('error'), { status: 0 });

    expect(error?.kind).toBe('network');
  });

  it('create envía el producto en formato API', () => {
    let result: Product | undefined;
    repository.create(product).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/bp/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(apiProduct);
    req.flush({ message: 'Product added successfully', data: apiProduct });

    expect(result).toEqual(product);
  });

  it('create traduce un duplicado a AppError', () => {
    let error: AppError | undefined;
    repository.create(product).subscribe({ error: (e) => (error = e) });

    httpMock
      .expectOne('/bp/products')
      .flush({ message: 'Duplicate identifier found in the database' }, { status: 400, statusText: 'Bad Request' });

    expect(error?.kind).toBe('duplicate');
  });

  it('update usa el id en la URL y no lo manda en el body', () => {
    let result: Product | undefined;
    repository.update(product).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/bp/products/trj-crd');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).not.toHaveProperty('id');
    req.flush({ message: 'Product updated successfully', data: {} });

    expect(result).toEqual(product);
  });

  it('update traduce un 404 a AppError', () => {
    let error: AppError | undefined;
    repository.update(product).subscribe({ error: (e) => (error = e) });

    httpMock.expectOne('/bp/products/trj-crd').flush({}, { status: 404, statusText: 'Not Found' });

    expect(error?.kind).toBe('not-found');
  });

  it('delete llama a DELETE con el id codificado', () => {
    let done = false;
    repository.delete('a b').subscribe(() => (done = true));

    const req = httpMock.expectOne('/bp/products/a%20b');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Product removed successfully' });

    expect(done).toBe(true);
  });

  it('delete traduce un error a AppError', () => {
    let error: AppError | undefined;
    repository.delete('x').subscribe({ error: (e) => (error = e) });

    httpMock.expectOne('/bp/products/x').flush({}, { status: 500, statusText: 'Server Error' });

    expect(error?.kind).toBe('unknown');
  });

  it.each([
    ['true', true],
    ['false', false],
  ])('idExists interpreta la respuesta "%s"', (body, expected) => {
    let result: boolean | undefined;
    repository.idExists('uno').subscribe((r) => (result = r));

    const req = httpMock.expectOne('/bp/products/verification/uno');
    expect(req.request.method).toBe('GET');
    req.flush(body);

    expect(result).toBe(expected);
  });

  it('idExists traduce un error a AppError', () => {
    let error: AppError | undefined;
    repository.idExists('uno').subscribe({ error: (e) => (error = e) });

    httpMock.expectOne('/bp/products/verification/uno').flush('', { status: 500, statusText: 'Server Error' });

    expect(error?.kind).toBe('unknown');
  });
});
