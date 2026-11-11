/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias de búsqueda y paginación de productos.
 */

import { Product } from './product';
import { buildSearchIndex, paginate, searchProducts } from './product-query';

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

describe('searchProducts', () => {
  const index = buildSearchIndex(products);
  const ids = (term: string) => searchProducts(index, term).map((p) => p.id);

  it('devuelve todo si el término está vacío o son espacios', () => {
    expect(searchProducts(index, '')).toBe(products);
    expect(searchProducts(index, '   ')).toBe(products);
  });

  it('busca por nombre sin distinguir mayúsculas', () => {
    expect(ids('AHORROS')).toEqual(['cta-aho']);
  });

  it('ignora las tildes en ambos sentidos', () => {
    expect(ids('prestamo')).toEqual(['prs-hip']);
    expect(ids('crédito')).toEqual(['trj-crd']);
  });

  it('busca por descripción y por id', () => {
    expect(ids('vivienda')).toEqual(['prs-hip']);
    expect(ids('cta-')).toEqual(['cta-aho']);
  });

  it('conserva el orden original de los resultados', () => {
    expect(ids('cuenta')).toEqual(['cta-aho']);
    expect(ids('a')).toEqual(['trj-crd', 'cta-aho', 'prs-hip']);
  });

  it('devuelve vacío si no hay coincidencias', () => {
    expect(ids('zzz')).toEqual([]);
  });

  it('no encuentra términos que cruzan el límite entre dos campos', () => {
    // El id termina en "crd" y el nombre empieza por "tarjetas": no debe coincidir "crd tarjetas".
    expect(ids('crd tarjetas')).toEqual([]);
    expect(ids('crdtarjetas')).toEqual([]);
  });

  it('reutiliza el mismo índice para varias búsquedas', () => {
    expect(ids('ahorros')).toEqual(['cta-aho']);
    expect(ids('hipotecario')).toEqual(['prs-hip']);
  });
});

describe('buildSearchIndex', () => {
  it('guarda un texto normalizado por producto, en el mismo orden', () => {
    const { texts } = buildSearchIndex(products);
    expect(texts).toHaveLength(products.length);
    expect(texts[2]).toContain('prestamo hipotecario');
    expect(texts[2]).not.toMatch(/[A-ZÁÉÍÓÚ]/);
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
