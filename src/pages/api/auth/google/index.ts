import { supabaseAuthHelper } from '@/utils/supabase-auth-helper';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, redirect, cookies, request }) => {
  const state = url.searchParams.get('state');

  const supabase = supabaseAuthHelper({ cookies, request });
  const queryParams: Record<string, string> = {
    prompt: 'select_account',
  };
  if (state) {
    queryParams['state'] = state;
  }

  const google = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: import.meta.env.PUBLIC_HOST + '/api/auth/google/callback',
      scopes: 'email profile',
      queryParams,
    },
  });
  if (google.error) throw google.error;

  return redirect(google.data.url, 302);
};
