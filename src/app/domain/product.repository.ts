/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Contrato de acceso a datos de productos. Abstracción de la que dependen los casos de uso.
 */

import { Observable } from 'rxjs';
import { Product } from './product';

export abstract class ProductRepository {
  abstract getAll(): Observable<Product[]>;
  abstract create(product: Product): Observable<Product>;
  abstract update(product: Product): Observable<Product>;
  abstract delete(id: string): Observable<void>;
  abstract idExists(id: string): Observable<boolean>;
}
