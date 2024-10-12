import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const token = context.url.searchParams.get('token');

  return new Response(JSON.stringify({ message: 'Cancel ' + token }));
};
