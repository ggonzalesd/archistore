import type { APIRoute } from 'astro';

import { supabase } from '@/providers/supabase';
import { checkFreeJwtToken } from '@/providers/jwt';
import { AppError, responseError } from '@/utils/app-error';

export const GET: APIRoute = async ({ params, url, rewrite, locals }) => {
  let isOk = false;

  const freeQuery = url.searchParams.get('free');
  if (typeof freeQuery === 'string') {
    const free = checkFreeJwtToken(freeQuery);
    if (free && typeof free !== 'string' && typeof free.validate === 'number') {
      if (new Date().getTime() >= free.validate) {
        isOk = true;
      }
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

  console.log(params.slug);

  const result = await supabase.storage
    .from('app')
    .createSignedUrl('download/profile.jpg', 60);

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
