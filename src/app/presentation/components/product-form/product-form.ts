/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Formulario de producto reutilizable para alta y edición (solo presentación).
 */

import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CheckProductIdUseCase } from '../../../application/product.use-cases';
import { Product } from '../../../domain/product';
import { addOneYear, todayIso } from '../../../shared/utils/date';
import { errorMessage } from '../../forms/error-messages';
import { dateNotInPast, requiredTrimmed, uniqueId } from '../../forms/product-validators';

type FieldName = 'id' | 'name' | 'description' | 'logo' | 'dateRelease' | 'dateRevision';

// Texto del diseño D2 para un ID vacío.
const ID_REQUIRED_MESSAGE = 'ID no válido!';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {
  /** Producto a editar. Si es null el formulario funciona en modo alta. */
  readonly product = input<Product | null>(null);
  readonly saving = input(false);
  readonly submitError = input('');
  readonly save = output<Product>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly checkProductId = inject(CheckProductIdUseCase);

  // Fecha de liberación original del producto en edición. Debe declararse antes de `form`, cuyos validadores la leen.
  private originalRelease: string | null = null;

  protected readonly form = this.fb.group({
    id: this.fb.control('', {
      validators: [requiredTrimmed, Validators.minLength(3), Validators.maxLength(10)],
      asyncValidators: [uniqueId((id) => this.checkProductId.execute(id))],
    }),
    name: this.fb.control('', [requiredTrimmed, Validators.minLength(5), Validators.maxLength(100)]),
    description: this.fb.control('', [requiredTrimmed, Validators.minLength(10), Validators.maxLength(200)]),
    logo: this.fb.control('', [requiredTrimmed]),
    dateRelease: this.fb.control('', [Validators.required, (control) => this.releaseNotInPast(control)]),
    dateRevision: this.fb.control({ value: '', disabled: true }),
  });

  protected readonly minDate = todayIso();
  protected readonly title = computed(() => (this.product() ? 'Formulario de Edición' : 'Formulario de Registro'));

  // Cualquier evento del formulario (valor, estado, touched) actualiza la vista, incluso el de validadores asíncronos.
  private readonly formEvents = toSignal(this.form.events);

  constructor() {
    this.form.controls.dateRelease.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((release) => this.form.controls.dateRevision.setValue(addOneYear(release)));
  }

  ngOnInit(): void {
    this.fillFromProduct();
  }

  protected message(field: FieldName): string {
    this.formEvents();
    const control = this.form.controls[field];
    if (!control.invalid || !(control.touched || control.dirty)) {
      return '';
    }
    return errorMessage(control.errors, field === 'id' ? ID_REQUIRED_MESSAGE : undefined);
  }

  protected hasError(field: FieldName): boolean {
    return this.message(field) !== '';
  }

  protected reset(): void {
    this.form.reset();
    this.fillFromProduct();
  }

  protected submit(): void {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.save.emit({
      id: value.id.trim(),
      name: value.name.trim(),
      description: value.description.trim(),
      logo: value.logo.trim(),
      dateRelease: value.dateRelease,
      dateRevision: value.dateRevision,
    });
  }

  // En edición, una fecha de liberación ya pasada es válida mientras no se modifique.
  private releaseNotInPast(control: AbstractControl): ValidationErrors | null {
    return control.value === this.originalRelease ? null : dateNotInPast(control);
  }

  private fillFromProduct(): void {
    const product = this.product();
    this.originalRelease = null;
    if (!product) {
      this.form.controls.id.enable();
      return;
    }
    // Se deshabilita antes de cargar el valor para no validar contra el servidor un ID que ya existe.
    this.originalRelease = product.dateRelease;
    this.form.controls.id.disable();
    this.form.patchValue(product);
    this.form.controls.dateRevision.setValue(addOneYear(product.dateRelease));
  }
}
