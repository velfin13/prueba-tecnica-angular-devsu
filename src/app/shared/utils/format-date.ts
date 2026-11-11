/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Formateo de fechas para mostrar en la interfaz.
 */

/** Convierte `YYYY-MM-DD` a `DD/MM/YYYY`. Si el formato no es válido devuelve el valor original. */
export const formatDate = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};
