/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pantalla de alta de producto (F4).
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CreateProductUseCase } from '../../../application/product.use-cases';
import { Product } from '../../../domain/product';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  selector: 'app-product-create-page',
  imports: [ProductForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-create-page.html',
})
export class ProductCreatePage {
  private readonly createProduct = inject(CreateProductUseCase);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly saving = signal(false);
  protected readonly submitError = signal('');

  protected onSave(product: Product): void {
    this.saving.set(true);
    this.submitError.set('');
    this.createProduct
      .execute(product)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: (error: Error) => {
          this.submitError.set(error.message);
          this.saving.set(false);
        },
      });
  }
}
