import type { APIRoute } from 'astro';

import { getFromCode } from '@/providers/google';
import { generateJwtToken } from '@/providers/jwt';
import { supabaseCreateUser, supabaseGetUser } from '@/providers/supabase';

import { responseError } from '@/utils/app-error';

export const GET: APIRoute = async (context) => {
  // Verific if where is a param 'code'
  const state = context.url.searchParams.get('state');
  const code = context.url.searchParams.get('code');

  try {
    const payload = await getFromCode(code);

    // Check if there is an user in our database
    let supaUser = await supabaseGetUser('google/' + payload.sub);

    if (!supaUser) {
      supaUser = await supabaseCreateUser(
        'google/' + payload.sub,
        payload.name,
        payload.picture,
        payload.email,
      );
    }

    const payloadJwt = {
      sub: supaUser.id,
      roles: supaUser.roles,
      name: supaUser.display,
      photo: supaUser.photo,
    };
    const jwt = generateJwtToken(payloadJwt);

    context.cookies.set('x-auth', jwt, {
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });

    return context.redirect(state ?? '/', 302);
  } catch (e) {
    return responseError(e, context.rewrite, context.locals);
  }
};
