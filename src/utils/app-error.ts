import crypto from 'node:crypto';
import type { APIRoute } from 'astro';

export class AppError extends Error {
  status: number;
  encrypted: boolean;
  constructor(message: string, status: number = 500, encrypted = true) {
    super(message);
    this.status = status;
    this.encrypted = encrypted;
  }

  withEncrypted(encrypted: boolean = true) {
    this.encrypted = encrypted;
    return this;
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }

  static unauthorized(message: string) {
    return new AppError(message, 401);
  }

  static notFound(message: string) {
    return new AppError(message, 404);
  }

  static serverError(message: string) {
    return new AppError(message);
  }
}

export const responseError = (
  e: unknown,
  rewrite: Parameters<APIRoute>[0]['rewrite'],
  locals: Parameters<APIRoute>[0]['locals'],
) => {
  locals.error = {
    message: 'Something When wrong',
    status: 500,
    encrypted: true,
  };

  if (e instanceof AppError) {
    locals.error.status = e.status;
    locals.error.encrypted = e.encrypted;
  }

  if (e instanceof Error) {
    locals.error.message = e.message;
  }

  if (typeof e === 'string') {
    locals.error.message = e;
  }

  if (locals.error.encrypted) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      import.meta.env.SECRET_APP_ERROR_SECRET,
      iv,
    );
    let encrypted = cipher.update(locals.error.message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    locals.error.message = iv.toString('hex') + '/' + encrypted;
  }

  return rewrite('/error');
};
