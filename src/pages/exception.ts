import { AppError, responseError } from '@/utils/app-error';
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ rewrite, locals }) => {
  try {
    throw AppError.serverError(
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet alias perferendis quisquam dignissimos quas, aspernatur. sequi atque dicta magni repellat suscipit delectus fuga quaerat eligendi illum tempora, iure, earum doloremque.',
    ).withEncrypted(true);
  } catch (e) {
    return responseError(e, { rewrite, locals });
  }
};
