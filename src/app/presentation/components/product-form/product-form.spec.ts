/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del formulario de producto.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CheckProductIdUseCase } from '../../../application/product.use-cases';
import { Product } from '../../../domain/product';
import { ProductForm } from './product-form';

const FUTURE = '2099-03-15';

describe('ProductForm', () => {
  let fixture: ComponentFixture<ProductForm>;
  let exists: ReturnType<typeof vi.fn>;
  const root = () => fixture.nativeElement as HTMLElement;
  const input = (id: string) => root().querySelector<HTMLInputElement>(`#pf-${id}`)!;
  const errorOf = (id: string) => root().querySelector(`#pf-${id}-error`)?.textContent?.trim() ?? '';
  const submitButton = () => root().querySelector<HTMLButtonElement>('button[type=submit]')!;

  const type = async (id: string, value: string) => {
    const el = input(id);
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  // El validador de ID espera 300 ms antes de consultar; se usan timers reales.
  const wait = async (ms: number) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    await fixture.whenStable();
  };

  const fillValid = async () => {
    await type('id', 'abc');
    await wait(350);
    await type('name', 'Tarjeta de crédito');
    await type('description', 'Descripción suficientemente larga');
    await type('logo', 'logo.png');
    await type('release', FUTURE);
  };

  const create = async (product: Product | null = null) => {
    TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [{ provide: CheckProductIdUseCase, useValue: { execute: exists } }],
    });
    fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('product', product);
    await fixture.whenStable();
  };

  beforeEach(() => {
    exists = vi.fn(() => of(false));
  });

  it('no muestra errores al abrir el formulario', async () => {
    await create();
    expect(errorOf('id')).toBe('');
    expect(errorOf('name')).toBe('');
  });

  it('muestra "requerido" al salir de un campo vacío', async () => {
    await create();
    await type('name', '');
    expect(errorOf('name')).toBe('Este campo es requerido!');
    expect(input('name').classList).toContain('invalid');
  });

  it.each([
    ['id', 'ab', 'Mínimo 3 caracteres'],
    ['id', 'a'.repeat(11), 'Máximo 10 caracteres'],
    ['name', 'abcd', 'Mínimo 5 caracteres'],
    ['name', 'a'.repeat(101), 'Máximo 100 caracteres'],
    ['description', 'corta', 'Mínimo 10 caracteres'],
    ['description', 'a'.repeat(201), 'Máximo 200 caracteres'],
  ])('valida longitud de %s con "%s"', async (field, value, message) => {
    await create();
    await type(field, value);
    expect(errorOf(field)).toBe(message);
  });

  it('acepta longitudes en el límite', async () => {
    await create();
    await type('id', 'abc');
    await type('name', 'abcde');
    await type('description', 'a'.repeat(10));
    expect(errorOf('name')).toBe('');
    expect(errorOf('description')).toBe('');
  });

  it('rechaza solo espacios como valor requerido', async () => {
    await create();
    await type('logo', '     ');
    expect(errorOf('logo')).toBe('Este campo es requerido!');
  });

  it('rechaza una fecha de liberación pasada', async () => {
    await create();
    await type('release', '2000-01-01');
    expect(errorOf('release')).toBe('La fecha debe ser igual o mayor a la fecha actual');
  });

  it('calcula la fecha de revisión un año después y la deja deshabilitada', async () => {
    await create();
    await type('release', FUTURE);
    expect(input('revision').value).toBe('2100-03-15');
    expect(input('revision').disabled).toBe(true);
  });

  it('marca el ID como inválido si ya existe', async () => {
    exists.mockReturnValue(of(true));
    await create();
    await type('id', 'abc');
    await wait(350);
    expect(errorOf('id')).toContain('Ya existe un producto con ese ID');
  });

  it('no consulta la existencia mientras el ID no cumple la longitud', async () => {
    await create();
    await type('id', 'ab');
    await wait(400);
    expect(exists).not.toHaveBeenCalled();
  });

  it('al enviar con errores muestra todos y no emite', async () => {
    await create();
    const emitted: Product[] = [];
    fixture.componentInstance.save.subscribe((p) => emitted.push(p));

    submitButton().click();
    await fixture.whenStable();

    expect(emitted).toEqual([]);
    expect(errorOf('id')).toBe('Este campo es requerido!');
    expect(errorOf('name')).toBe('Este campo es requerido!');
    expect(errorOf('release')).toBe('Este campo es requerido!');
    expect(submitButton().getAttribute('aria-disabled')).toBe('true');
  });

  it('emite el producto sin espacios sobrantes cuando es válido', async () => {
    await create();
    const emitted: Product[] = [];
    fixture.componentInstance.save.subscribe((p) => emitted.push(p));

    await fillValid();
    await type('name', '  Tarjeta de crédito  ');
    submitButton().click();
    await fixture.whenStable();

    expect(emitted).toEqual([
      {
        id: 'abc',
        name: 'Tarjeta de crédito',
        description: 'Descripción suficientemente larga',
        logo: 'logo.png',
        dateRelease: FUTURE,
        dateRevision: '2100-03-15',
      },
    ]);
  });

  it('Reiniciar limpia valores y errores', async () => {
    await create();
    await type('name', 'ab');
    expect(errorOf('name')).not.toBe('');

    root().querySelector<HTMLButtonElement>('.btn-secondary')!.click();
    await fixture.whenStable();

    expect(input('name').value).toBe('');
    expect(errorOf('name')).toBe('');
  });

  it('muestra el error del servidor y bloquea el botón mientras guarda', async () => {
    await create();
    fixture.componentRef.setInput('submitError', 'Ya existe un producto con ese ID.');
    fixture.componentRef.setInput('saving', true);
    await fixture.whenStable();

    expect(root().querySelector('.submit-error')?.textContent).toContain('Ya existe');
    expect(submitButton().disabled).toBe(true);
    expect(submitButton().textContent).toContain('Enviando');
  });

  describe('modo edición', () => {
    const product: Product = {
      id: 'trj-crd',
      name: 'Tarjetas de Crédito',
      description: 'Tarjeta de consumo bajo crédito',
      logo: 'logo.png',
      dateRelease: FUTURE,
      dateRevision: '2100-03-15',
    };

    it('precarga los datos y deshabilita el ID', async () => {
      await create(product);
      expect(input('id').value).toBe('trj-crd');
      expect(input('id').disabled).toBe(true);
      expect(input('name').value).toBe('Tarjetas de Crédito');
      expect(input('revision').value).toBe('2100-03-15');
    });

    it('no consulta la existencia del ID', async () => {
      await create(product);
      await wait(400);
      expect(exists).not.toHaveBeenCalled();
    });

    it('emite el producto editado con el mismo ID', async () => {
      await create(product);
      const emitted: Product[] = [];
      fixture.componentInstance.save.subscribe((p) => emitted.push(p));

      await type('name', 'Nombre actualizado');
      submitButton().click();
      await fixture.whenStable();

      expect(emitted[0]).toMatchObject({ id: 'trj-crd', name: 'Nombre actualizado' });
    });

    it('Reiniciar restaura los datos originales', async () => {
      await create(product);
      await type('name', 'Otro nombre distinto');
      root().querySelector<HTMLButtonElement>('.btn-secondary')!.click();
      await fixture.whenStable();
      expect(input('name').value).toBe('Tarjetas de Crédito');
      expect(input('id').disabled).toBe(true);
    });
  });
});
