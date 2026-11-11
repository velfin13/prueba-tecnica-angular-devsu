/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Implementación HTTP del repositorio de productos.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Product } from '../domain/product';
import { ProductRepository } from '../domain/product.repository';
import { API_BASE_URL } from './api.config';
import { toAppError } from './api-error.mapper';
import { ItemResponseDto, ListResponseDto } from './product-api.dto';
import { toApi, toDomain } from './product.mapper';

@Injectable()
export class HttpProductRepository extends ProductRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<ListResponseDto>(this.url).pipe(
      map((response) => response.data.map(toDomain)),
      catchError((error) => throwError(() => toAppError(error))),
    );
  }

  create(product: Product): Observable<Product> {
    return this.http.post<ItemResponseDto>(this.url, toApi(product)).pipe(
      map(() => product),
      catchError((error) => throwError(() => toAppError(error))),
    );
  }

  update(product: Product): Observable<Product> {
    // El contrato del PUT recibe el id en la URL y no lo incluye en el body ni en la respuesta.
    const { id, ...body } = toApi(product);
    return this.http.put<ItemResponseDto>(`${this.url}/${encodeURIComponent(id)}`, body).pipe(
      map(() => product),
      catchError((error) => throwError(() => toAppError(error))),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.url}/${encodeURIComponent(id)}`).pipe(
      map(() => undefined),
      catchError((error) => throwError(() => toAppError(error))),
    );
  }

  idExists(id: string): Observable<boolean> {
    return this.http
      .get(`${this.url}/verification/${encodeURIComponent(id)}`, { responseType: 'text' })
      .pipe(
        map((body) => body.trim() === 'true'),
        catchError((error) => throwError(() => toAppError(error))),
      );
  }
}
