import { createLoginUrl, generateGoogleClient } from '@/providers/google';
import type { APIRoute } from 'astro';

export const GET: APIRoute = (context) => {
  const google = generateGoogleClient();

  const authUrl = createLoginUrl(google, context.url.searchParams.get('state'));

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
    },
  });
};
