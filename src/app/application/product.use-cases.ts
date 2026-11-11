/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Casos de uso de productos: consultar, crear, actualizar, eliminar y verificar existencia de ID.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppError } from '../domain/app-error';
import { Product } from '../domain/product';
import { ProductRepository } from '../domain/product.repository';

@Injectable({ providedIn: 'root' })
export class GetProductsUseCase {
  private readonly repository = inject(ProductRepository);
  execute(): Observable<Product[]> {
    return this.repository.getAll();
  }
}

@Injectable({ providedIn: 'root' })
export class GetProductByIdUseCase {
  private readonly repository = inject(ProductRepository);

  // La API documentada no expone una consulta por ID: se obtiene de la lista.
  execute(id: string): Observable<Product> {
    return this.repository.getAll().pipe(
      map((products) => {
        const product = products.find((item) => item.id === id);
        if (!product) {
          throw new AppError('not-found', 'No se encontró el producto solicitado.');
        }
        return product;
      }),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class CreateProductUseCase {
  private readonly repository = inject(ProductRepository);
  execute(product: Product): Observable<Product> {
    return this.repository.create(product);
  }
}

@Injectable({ providedIn: 'root' })
export class UpdateProductUseCase {
  private readonly repository = inject(ProductRepository);
  execute(product: Product): Observable<Product> {
    return this.repository.update(product);
  }
}

@Injectable({ providedIn: 'root' })
export class DeleteProductUseCase {
  private readonly repository = inject(ProductRepository);
  execute(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}

@Injectable({ providedIn: 'root' })
export class CheckProductIdUseCase {
  private readonly repository = inject(ProductRepository);
  execute(id: string): Observable<boolean> {
    return this.repository.idExists(id);
  }
}
