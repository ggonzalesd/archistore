import type { APIRoute } from 'astro';

import { createLoginUrl, generateGoogleClient } from '@/providers/google';

export const GET: APIRoute = ({ url }) => {
  const state = url.searchParams.get('state');

  const google = generateGoogleClient();

  const authUrl = createLoginUrl(google, state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
    },
  });
};
