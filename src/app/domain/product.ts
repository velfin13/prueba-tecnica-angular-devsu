/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Entidad de dominio Product (producto financiero).
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  dateRelease: string;
  dateRevision: string;
}
