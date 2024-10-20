import type { APIRoute } from 'astro';

import { generateJwtToken } from '@/providers/jwt';

import { AppError, responseError } from '@/utils/app-error';
import { supabaseAuthHelper } from '@/utils/supabase-auth-helper';

export const GET: APIRoute = async ({
  url,
  request,
  cookies,
  redirect,
  locals,
  rewrite,
}) => {
  // Verific if where is a param 'code'
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  const supabase = supabaseAuthHelper({ request, cookies }, false);

  try {
    const session = await supabase.auth.exchangeCodeForSession(code!);

    if (session.error) {
      const e = session.error;
      throw new AppError(e.message, e.status, true);
    }

    await supabase.auth.signOut({ scope: 'global' });

    const payload = session.data;

    const payloadJwt = {
      sub: payload.user.id,
      roles: 0,
      name: payload.user.user_metadata.full_name,
      photo: payload.user.user_metadata.picture,
    };
    const jwt = generateJwtToken(payloadJwt);

    cookies.set('x-auth', jwt, {
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });

    return redirect(state ?? '/', 302);
  } catch (e) {
    return responseError(e, { locals, rewrite });
  }
};
