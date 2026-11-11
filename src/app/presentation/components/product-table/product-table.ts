/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Tabla de productos (solo presentación).
 */

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../domain/product';
import { formatDate } from '../../../shared/utils/format-date';
import { ActionsMenu } from '../actions-menu/actions-menu';
import { ProductLogo } from '../product-logo/product-logo';

@Component({
  selector: 'app-product-table',
  imports: [ProductLogo, ActionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-table.html',
  styleUrl: './product-table.css',
})
export class ProductTable {
  readonly products = input.required<Product[]>();
  readonly edit = output<Product>();
  readonly remove = output<Product>();

  protected readonly formatDate = formatDate;
}
