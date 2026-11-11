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

// Los campos se unen con un salto de línea, que no se puede escribir en el buscador:
// así un término nunca coincide a caballo entre dos campos.
const FIELD_SEPARATOR = '\n';

/** Productos junto a su texto de búsqueda ya normalizado, en la misma posición. */
export interface SearchIndex {
  products: Product[];
  texts: string[];
}

/** Normaliza una sola vez al cargar, de modo que cada búsqueda posterior solo compare texto. */
export const buildSearchIndex = (products: Product[]): SearchIndex => ({
  products,
  texts: products.map((product) => normalize([product.id, product.name, product.description].join(FIELD_SEPARATOR))),
});

export const searchProducts = (index: SearchIndex, term: string): Product[] => {
  const query = normalize(term);
  if (!query) {
    return index.products;
  }
  const matches: Product[] = [];
  index.texts.forEach((text, position) => {
    if (text.includes(query)) {
      matches.push(index.products[position]);
    }
  });
  return matches;
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
