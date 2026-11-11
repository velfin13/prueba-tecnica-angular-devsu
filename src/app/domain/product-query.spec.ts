/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de búsqueda y paginación de productos.
 */

import { Product } from './product';
import { filterProducts, paginate } from './product-query';

const make = (id: string, name: string, description = 'Descripción genérica'): Product => ({
  id,
  name,
  description,
  logo: 'logo.png',
  dateRelease: '2025-01-01',
  dateRevision: '2026-01-01',
});

const products = [
  make('trj-crd', 'Tarjetas de Crédito', 'Consumo bajo la modalidad de crédito'),
  make('cta-aho', 'Cuenta de Ahorros', 'Cuenta para ahorrar'),
  make('prs-hip', 'Préstamo Hipotecario', 'Financia tu vivienda'),
];

describe('filterProducts', () => {
  it('devuelve todo si el término está vacío o son espacios', () => {
    expect(filterProducts(products, '')).toBe(products);
    expect(filterProducts(products, '   ')).toBe(products);
  });

  it('busca por nombre sin distinguir mayúsculas', () => {
    expect(filterProducts(products, 'AHORROS').map((p) => p.id)).toEqual(['cta-aho']);
  });

  it('ignora las tildes en ambos sentidos', () => {
    expect(filterProducts(products, 'prestamo').map((p) => p.id)).toEqual(['prs-hip']);
    expect(filterProducts(products, 'crédito').map((p) => p.id)).toEqual(['trj-crd']);
  });

  it('busca por descripción y por id', () => {
    expect(filterProducts(products, 'vivienda').map((p) => p.id)).toEqual(['prs-hip']);
    expect(filterProducts(products, 'cta-').map((p) => p.id)).toEqual(['cta-aho']);
  });

  it('devuelve vacío si no hay coincidencias', () => {
    expect(filterProducts(products, 'zzz')).toEqual([]);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 12 }, (_, i) => i + 1);

  it('devuelve la primera página', () => {
    expect(paginate(items, 1, 5)).toEqual({ items: [1, 2, 3, 4, 5], page: 1, totalPages: 3, totalItems: 12 });
  });

  it('devuelve una página incompleta al final', () => {
    expect(paginate(items, 3, 5).items).toEqual([11, 12]);
  });

  it('ajusta una página fuera de rango', () => {
    expect(paginate(items, 99, 5).page).toBe(3);
    expect(paginate(items, 0, 5).page).toBe(1);
  });

  it('con lista vacía devuelve una sola página vacía', () => {
    expect(paginate([], 1, 5)).toEqual({ items: [], page: 1, totalPages: 1, totalItems: 0 });
  });
});
