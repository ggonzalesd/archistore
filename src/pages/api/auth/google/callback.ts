import type { APIRoute } from 'astro';

import { getFromCode } from '@/providers/google';
import { generateJwtToken } from '@/providers/jwt';
import { supabaseCreateUser, supabaseGetUser } from '@/providers/supabase';

import { AppError } from '@/utils/app-error';

const responseError = (message: string, status: number) =>
  new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
    },
  );

export const GET: APIRoute = async ({ url, redirect, cookies }) => {
  // Verific if where is a param 'code'
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

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

    cookies.set('x-auth', jwt, {
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });

    return redirect(state ?? '/', 302);
  } catch (e) {
    if (e instanceof AppError) {
      return responseError(e.message, e.status);
    }
    if (e instanceof Error) {
      return responseError(e.message, 500);
    }
    return responseError('Something Went Wrong', 500);
  }
};
