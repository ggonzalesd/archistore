import type { APIRoute } from 'astro';

import { checkFreeJwtToken } from '@/providers/jwt';

import { AppError, responseError } from '@/utils/app-error';
import { supabaseAuthHelper } from '@/utils/supabase-auth-helper';
import {
  supabaseGetOrderProduct,
  supabaseGetProduct,
} from '@/providers/supabase';

export const GET: APIRoute = async ({
  params,
  url,
  rewrite,
  locals,
  cookies,
  request,
}) => {
  let isOk = false;
  const slug = params.slug!;

  const freeQuery = url.searchParams.get('free');
  if (typeof freeQuery === 'string') {
    const free = checkFreeJwtToken(freeQuery);
    if (free && typeof free !== 'string' && typeof free.validate === 'number') {
      if (new Date().getTime() >= free.validate && free.slug === params.slug)
        isOk = true;
    }
    if (!isOk) {
      return responseError(
        AppError.unauthorized('Token no valido').withEncrypted(false),
        {
          rewrite,
          locals,
        },
      );
    }
  }

  const supabase = supabaseAuthHelper({ request, cookies });

  if (!isOk) {
    const client_id = locals.user?.id!;

    if (client_id == null)
      throw AppError.unauthorized('User is not authenticated').withEncrypted(
        false,
      );

    const order = await supabaseGetOrderProduct(supabase, client_id, slug);

    if (!order.approved) {
      throw AppError.unauthorized(
        "Your can't download this resource for now",
      ).withEncrypted(false);
    }
  }

  const product = await supabaseGetProduct(supabase, slug);

  const result = await supabase.storage
    .from('app')
    .createSignedUrl('download/' + product.filename, 60);

  if (result.error) {
    return new Response(JSON.stringify({ message: result.error.message }));
  }

  if (typeof result.data.signedUrl !== 'string') {
    return new Response(JSON.stringify({ message: 'Error in server' }));
  }

  const file = await fetch(result.data.signedUrl);

  if (!file.ok) {
    return new Response(JSON.stringify('There is file'));
  }

  return new Response(file.body, {
    status: 200,
    headers: {
      'Content-Type': file.headers.get('Content-Type') ?? '',
      'Cache-Control': 'public, max-age=60',
    },
  });
};
