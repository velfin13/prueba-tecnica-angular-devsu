/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pantalla de listado de productos financieros (F1, F2 y F3).
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListFooter } from '../../components/list-footer/list-footer';
import { ProductTable } from '../../components/product-table/product-table';
import { TableSkeleton } from '../../components/table-skeleton/table-skeleton';
import { ProductListStore } from './product-list.store';

@Component({
  selector: 'app-product-list-page',
  imports: [RouterLink, ProductTable, TableSkeleton, ListFooter],
  providers: [ProductListStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list-page.html',
  styleUrl: './product-list-page.css',
})
export class ProductListPage implements OnInit {
  protected readonly store = inject(ProductListStore);

  ngOnInit(): void {
    this.store.load();
  }

  protected onSearch(event: Event): void {
    this.store.setSearch((event.target as HTMLInputElement).value);
  }
}
