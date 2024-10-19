import type { SafeParseReturnType } from 'astro:schema';
import { AppError } from './app-error';

export const zodParseResolve = <T, O>(parsed: SafeParseReturnType<T, O>) => {
  if (!parsed.success) {
    const message = parsed.error.issues
      .map(({ message }) => message)
      .join(', ');
    throw AppError.serverError('Zod Error: ' + message);
  }

  return parsed.data;
};
