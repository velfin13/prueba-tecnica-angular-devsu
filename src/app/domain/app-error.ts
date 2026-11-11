/**
 * @author Velfin Velasquez <velfinvelasquez@gmail.com>
 * @date 2026-11-10
 * @description Error de aplicación con tipo y mensaje apto para mostrar al usuario.
 */

export type AppErrorKind = 'network' | 'not-found' | 'duplicate' | 'validation' | 'unknown';

export class AppError extends Error {
  constructor(
    readonly kind: AppErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
