import { generateGoogleClient } from '@/providers/google';
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const google = generateGoogleClient();

  const authUrl = google.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ],
    prompt: 'consent',
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
    },
  });
};
