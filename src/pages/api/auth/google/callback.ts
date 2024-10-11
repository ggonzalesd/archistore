import { generateGoogleClient } from '@/providers/google';
import { generateJwtToken } from '@/providers/jwt';
import { supabase } from '@/providers/supabase';
import { googleUserInfoSchema } from '@/schema/google.schema';
import { supaUserInfoSchema } from '@/schema/supabase.schema';
import type { APIRoute } from 'astro';
import type { Credentials } from 'google-auth-library';

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
  const code = url.searchParams.get('code');
  if (!code) {
    return responseError('Authorization code not found!', 400);
  }

  // Check if the 'code' is valid
  const google = generateGoogleClient();
  let tokens: Credentials | null = null;

  try {
    const tokenRes = await google.getToken(code);
    tokens = tokenRes.tokens;
  } catch (e) {
    return responseError('Authorization code not allowed!', 400);
  }

  google.setCredentials(tokens);
  if (tokens.id_token == null) {
    return responseError('Authorization id token missing', 400);
  }

  // Get Login ticket
  const ticket = await google.verifyIdToken({
    idToken: tokens.id_token,
    audience: import.meta.env.SECRET_GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const userid = payload?.sub;

  // Check if there is an user in our database
  const supaUser = await supabase
    .from('clients')
    .select('*')
    .eq('user_code', 'google/' + userid)
    .limit(1);

  if (supaUser.error) {
    return responseError('There is a problem with our services', 500);
  }

  let sub = null;
  let roles = 0;

  if (supaUser.data.length >= 1) {
    console.log(supaUser.data[0]);
    const { data, error } = supaUserInfoSchema.safeParse(supaUser.data[0]);
    if (error) {
      console.log(error);
      return responseError('Database is having problems', 500);
    }
    sub = data.id;
    roles = data.roles;
  } else {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo?access_token=' +
          google.credentials.access_token,
      );
      const userInfo = googleUserInfoSchema.parse(await response.json());

      const newUser = {
        user_code: 'google/' + userInfo.sub,
        display: userInfo.name,
        photo: userInfo.picture,
        email: userInfo.email,
        active: true,
        roles: 0,
      };

      const { error, data } = await supabase
        .from('clients')
        .insert([newUser])
        .select();

      if (error) throw error;

      sub = data[0].id;
    } catch (e) {
      console.log(e);
      return responseError('There is a problem on account creating', 500);
    }
  }

  const jwt = generateJwtToken({ sub, roles });

  if (jwt == null) {
    return responseError('There is a problem with the token', 500);
  }

  cookies.set('x-auth', jwt, {
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'strict',
  });

  return redirect('/', 302);
};
