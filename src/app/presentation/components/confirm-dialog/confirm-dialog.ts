/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Modal de confirmación (D4) con foco controlado, cierre con Escape y clic fuera.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  host: { '(document:keydown.escape)': 'onCancel()' },
})
export class ConfirmDialog {
  readonly message = input.required<string>();
  readonly confirmLabel = input('Eliminar');
  readonly busy = input(false);
  readonly error = input('');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');
  private readonly cancelButton = viewChild.required<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    // Al cerrar, el foco vuelve al elemento que abrió el modal.
    const opener = document.activeElement as HTMLElement | null;
    inject(DestroyRef).onDestroy(() => opener?.focus?.());
    // Se enfoca "Cancelar" por ser la opción no destructiva.
    afterNextRender(() => this.cancelButton().nativeElement.focus(), { injector: inject(Injector) });
  }

  protected onCancel(): void {
    if (!this.busy()) {
      this.cancel.emit();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  // Mantiene el foco dentro del modal.
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const focusable = Array.from(this.dialog().nativeElement.querySelectorAll<HTMLElement>('button:not([disabled])'));
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
