/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Casos de uso de productos: consultar, crear, actualizar, eliminar y verificar existencia de ID.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
