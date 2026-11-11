/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Pruebas unitarias del traductor de errores HTTP.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from '../domain/app-error';
import { toAppError } from './api-error.mapper';

const http = (status: number, error?: unknown) => new HttpErrorResponse({ status, error });

describe('toAppError', () => {
  it('status 0 → error de red', () => {
    expect(toAppError(http(0)).kind).toBe('network');
  });

  it('404 → not-found', () => {
    expect(toAppError(http(404)).kind).toBe('not-found');
  });

  it('400 con mensaje Duplicate → duplicate', () => {
    const error = toAppError(http(400, { message: 'Duplicate identifier found in the database' }));
    expect(error.kind).toBe('duplicate');
  });

  it('400 genérico → validation', () => {
    expect(toAppError(http(400, { message: 'Invalid body' })).kind).toBe('validation');
  });

  it('400 sin cuerpo → validation', () => {
    expect(toAppError(http(400)).kind).toBe('validation');
  });

  it('500 → unknown', () => {
    expect(toAppError(http(500)).kind).toBe('unknown');
  });

  it('no expone el stack del backend en el mensaje', () => {
    const error = toAppError(http(400, { message: 'Invalid body', stack: '/home/usuario/secreto.ts' }));
    expect(error.message).not.toContain('secreto');
  });

  it('devuelve el mismo AppError si ya lo es', () => {
    const original = new AppError('network', 'x');
    expect(toAppError(original)).toBe(original);
  });

  it('un error que no es HTTP → unknown', () => {
    expect(toAppError(new Error('boom')).kind).toBe('unknown');
  });
});
