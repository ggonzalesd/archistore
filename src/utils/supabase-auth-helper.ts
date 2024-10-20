import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';

export const supabaseClient = () => {
  return createClient(
    import.meta.env.SECRET_SUPABASE_URL,
    import.meta.env.SECRET_SUPABASE_SECRET,
  );
};

// Disabled the ServerClient cookie-setting functionality because
// Supabase auth cookies exceed 3000 characters and have an excessively
// long duration.
// Fix: disable cookies in callback
// I don't like this solution, but it's the only one that works to avoid issues.
export const supabaseAuthHelper = (
  Astro: Pick<Parameters<APIRoute>[0], 'cookies' | 'request'>,
  setter: boolean = true,
) => {
  return createServerClient(
    import.meta.env.SECRET_SUPABASE_URL,
    import.meta.env.SECRET_SUPABASE_SECRET,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(Astro.request.headers.get('Cookie') ?? '');
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (setter) Astro.cookies.set(name, value, options);
          });
        },
      },
    },
  );
};
