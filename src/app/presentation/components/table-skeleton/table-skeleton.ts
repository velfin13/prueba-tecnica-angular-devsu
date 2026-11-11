/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Marcador de carga con la forma de la tabla.
 */

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-table-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-skeleton.html',
  styleUrl: './table-skeleton.css',
})
export class TableSkeleton {
  readonly rows = input(5);

  protected rowIndexes(): number[] {
    return Array.from({ length: this.rows() }, (_, index) => index);
  }
}
