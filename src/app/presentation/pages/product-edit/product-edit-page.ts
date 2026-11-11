/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pantalla de edición de producto (F5).
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { GetProductByIdUseCase, UpdateProductUseCase } from '../../../application/product.use-cases';
import { Product } from '../../../domain/product';
import { ProductForm } from '../../components/product-form/product-form';

type EditStatus = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-product-edit-page',
  imports: [ProductForm, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-edit-page.html',
  styleUrl: './product-edit-page.css',
})
export class ProductEditPage implements OnInit {
  /** Id de la ruta (`withComponentInputBinding`). */
  readonly id = input.required<string>();

  private readonly getProduct = inject(GetProductByIdUseCase);
  private readonly updateProduct = inject(UpdateProductUseCase);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly status = signal<EditStatus>('loading');
  protected readonly product = signal<Product | null>(null);
  protected readonly loadError = signal('');
  protected readonly saving = signal(false);
  protected readonly submitError = signal('');

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.status.set('loading');
    this.getProduct
      .execute(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.product.set(product);
          this.status.set('ready');
        },
        error: (error: Error) => {
          this.loadError.set(error.message);
          this.status.set('error');
        },
      });
  }

  protected onSave(product: Product): void {
    this.saving.set(true);
    this.submitError.set('');
    this.updateProduct
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
