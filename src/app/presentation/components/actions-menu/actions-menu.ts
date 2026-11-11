/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Menú contextual (dropdown) con las acciones de cada producto.
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
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-actions-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './actions-menu.html',
  styleUrl: './actions-menu.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close(true)',
    '(window:resize)': 'close(false)',
  },
})
export class ActionsMenu {
  readonly label = input('Acciones');
  readonly edit = output<void>();
  readonly remove = output<void>();

  protected readonly isOpen = signal(false);
  protected readonly position = signal({ top: 0, right: 0 });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  constructor() {
    // El scroll de la tabla no burbujea: se escucha en fase de captura para cerrar el menú.
    const onScroll = () => this.close(false);
    document.addEventListener('scroll', onScroll, true);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('scroll', onScroll, true));
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close(true);
      return;
    }
    // Posición fija para que el menú no quede recortado por el scroll horizontal de la tabla.
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    this.position.set({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    this.isOpen.set(true);
    afterNextRender(() => this.items()[0]?.focus(), { injector: this.injector });
  }

  protected select(action: 'edit' | 'remove'): void {
    this.close(true);
    if (action === 'edit') {
      this.edit.emit();
    } else {
      this.remove.emit();
    }
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }
    event.preventDefault();
    const items = this.items();
    const current = items.indexOf(document.activeElement as HTMLElement);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    items[(current + step + items.length) % items.length]?.focus();
  }

  protected onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close(false);
    }
  }

  protected close(restoreFocus: boolean): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    if (restoreFocus) {
      this.trigger().nativeElement.focus();
    }
  }

  private items(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  }
}
