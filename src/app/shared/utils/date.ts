/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Utilidades de fechas en formato YYYY-MM-DD (sin depender de zona horaria).
 */

const pad = (value: number): string => String(value).padStart(2, '0');

const daysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();

/** Fecha local de hoy como `YYYY-MM-DD`. */
export const todayIso = (now: Date = new Date()): string =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** Suma un año a `YYYY-MM-DD`. El 29/02 pasa al 28/02 si el año siguiente no es bisiesto. Devuelve '' si la fecha no es válida. */
export const addOneYear = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return '';
  }
  const year = Number(match[1]) + 1;
  const month = Number(match[2]);
  const day = Math.min(Number(match[3]), daysInMonth(year, month));
  return `${year}-${pad(month)}-${pad(day)}`;
};
