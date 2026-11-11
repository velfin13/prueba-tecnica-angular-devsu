/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Estado de la pantalla de listado: carga, errores, búsqueda y paginación.
 */

import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { DeleteProductUseCase, GetProductsUseCase } from '../../../application/product.use-cases';
import { Product } from '../../../domain/product';
import { DEFAULT_PAGE_SIZE, PageSize, buildSearchIndex, paginate, searchProducts } from '../../../domain/product-query';

export type ListStatus = 'loading' | 'ready' | 'error';

/** Espera tras la última tecla antes de filtrar. */
export const SEARCH_DEBOUNCE_MS = 300;

@Injectable()
export class ProductListStore {
  private readonly getProducts = inject(GetProductsUseCase);
  private readonly deleteProduct = inject(DeleteProductUseCase);
  private readonly destroyRef = inject(DestroyRef);

  private readonly products = signal<Product[]>([]);
  private readonly requestedPage = signal(1);
  private readonly appliedSearch = signal('');
  private readonly typed$ = new Subject<string>();

  readonly status = signal<ListStatus>('loading');
  readonly errorMessage = signal('');
  /** Lo que se ve en el campo de texto; el filtro se aplica con retraso. */
  readonly search = signal('');
  readonly pageSize = signal<PageSize>(DEFAULT_PAGE_SIZE);

  readonly pendingDelete = signal<Product | null>(null);
  readonly deleting = signal(false);
  readonly deleteError = signal('');

  private readonly index = computed(() => buildSearchIndex(this.products()));
  private readonly filtered = computed(() => searchProducts(this.index(), this.appliedSearch()));
  readonly page = computed(() => paginate(this.filtered(), this.requestedPage(), this.pageSize()));

  constructor() {
    this.typed$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed()).subscribe((term) => {
      this.appliedSearch.set(term);
      this.requestedPage.set(1);
    });
  }

  load(): void {
    this.status.set('loading');
    this.getProducts
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.status.set('ready');
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
          this.status.set('error');
        },
      });
  }

  setSearch(term: string): void {
    this.search.set(term);
    this.typed$.next(term);
  }

  setPageSize(size: PageSize): void {
    this.pageSize.set(size);
    this.requestedPage.set(1);
  }

  goToPage(page: number): void {
    this.requestedPage.set(page);
  }

  requestDelete(product: Product): void {
    this.deleteError.set('');
    this.pendingDelete.set(product);
  }

  cancelDelete(): void {
    if (!this.deleting()) {
      this.pendingDelete.set(null);
    }
  }

  confirmDelete(): void {
    const product = this.pendingDelete();
    if (!product || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    this.deleteProduct
      .execute(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.products.update((products) => products.filter((item) => item.id !== product.id));
          this.pendingDelete.set(null);
          this.deleting.set(false);
        },
        error: (error: Error) => {
          this.deleteError.set(error.message);
          this.deleting.set(false);
        },
      });
  }
}
