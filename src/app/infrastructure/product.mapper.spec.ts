/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del mapper de productos.
 */

import { Product } from '../domain/product';
import { ProductApiDto } from './product-api.dto';
import { toApi, toDomain } from './product.mapper';

const dto: ProductApiDto = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'assets-1.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

describe('product.mapper', () => {
  it('convierte de la API (snake_case) al dominio (camelCase)', () => {
    expect(toDomain(dto)).toEqual({
      id: 'trj-crd',
      name: 'Tarjetas de Crédito',
      description: 'Tarjeta de consumo bajo la modalidad de crédito',
      logo: 'assets-1.png',
      dateRelease: '2025-01-01',
      dateRevision: '2026-01-01',
    });
  });

  it('recorta fechas ISO completas a YYYY-MM-DD', () => {
    const product = toDomain({
      ...dto,
      date_release: '2025-01-01T00:00:00.000Z',
      date_revision: '2026-01-01T00:00:00.000Z',
    });
    expect(product.dateRelease).toBe('2025-01-01');
    expect(product.dateRevision).toBe('2026-01-01');
  });

  it('convierte del dominio a la API', () => {
    const product: Product = toDomain(dto);
    expect(toApi(product)).toEqual(dto);
  });
});
