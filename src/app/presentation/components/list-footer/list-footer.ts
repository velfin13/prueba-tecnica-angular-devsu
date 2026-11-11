/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pie de la tabla: cantidad de resultados, paginación y selector de registros.
 */

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PAGE_SIZES, PageSize } from '../../../domain/product-query';

@Component({
  selector: 'app-list-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-footer.html',
  styleUrl: './list-footer.css',
})
export class ListFooter {
  readonly shown = input.required<number>();
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSize = input.required<PageSize>();

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<PageSize>();

  protected readonly pageSizes = PAGE_SIZES;

  protected onPageSize(event: Event): void {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value) as PageSize);
  }
}
