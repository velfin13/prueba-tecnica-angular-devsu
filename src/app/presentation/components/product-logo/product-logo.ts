/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Muestra el logo del producto o, si no carga, un avatar con sus iniciales.
 */

import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-product-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-logo.html',
  styleUrl: './product-logo.css',
})
export class ProductLogo {
  readonly src = input('');
  readonly name = input('');

  private readonly failedSrc = signal<string | null>(null);

  protected readonly showImage = computed(() => !!this.src() && this.failedSrc() !== this.src());
  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join(''),
  );

  protected onError(): void {
    this.failedSrc.set(this.src());
  }
}
