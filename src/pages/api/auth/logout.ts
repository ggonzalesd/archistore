import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ cookies }) => {
  cookies.delete('x-auth', {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
};
