/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Funciones puras para buscar y paginar productos.
 */

import { Product } from './product';

export const PAGE_SIZES = [5, 10, 20] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 5;

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

// Compara sin distinguir mayúsculas ni tildes.
const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const filterProducts = (products: Product[], term: string): Product[] => {
  const query = normalize(term);
  if (!query) {
    return products;
  }
  return products.filter((product) =>
    [product.id, product.name, product.description].some((field) => normalize(field).includes(query)),
  );
};

export const paginate = <T>(items: T[], page: number, pageSize: number): Page<T> => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    totalItems: items.length,
  };
};
