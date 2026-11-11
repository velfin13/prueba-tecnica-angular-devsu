/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Tipos de transferencia de datos (DTO) con el formato de la API.
 */

export interface ProductApiDto {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface ListResponseDto {
  data: ProductApiDto[];
}

export interface ItemResponseDto {
  message: string;
  data: Partial<ProductApiDto>;
}
