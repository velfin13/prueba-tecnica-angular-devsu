/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Conversión entre el DTO de la API y la entidad de dominio Product.
 */

import { Product } from '../domain/product';
import { ProductApiDto } from './product-api.dto';

// Normaliza la fecha al formato YYYY-MM-DD.
const toDay = (value: string): string => value.slice(0, 10);

export const toDomain = (dto: ProductApiDto): Product => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  logo: dto.logo,
  dateRelease: toDay(dto.date_release),
  dateRevision: toDay(dto.date_revision),
});

export const toApi = (product: Product): ProductApiDto => ({
  id: product.id,
  name: product.name,
  description: product.description,
  logo: product.logo,
  date_release: product.dateRelease,
  date_revision: product.dateRevision,
});
