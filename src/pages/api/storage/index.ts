import type { APIRoute } from 'astro';

import { supabase } from '@/providers/supabase';

export const GET: APIRoute = async ({ redirect }) => {
  const result = await supabase.storage
    .from('app')
    .createSignedUrl('download/profile.jpg', 60);

  if (result.error) {
    return new Response(JSON.stringify({ message: result.error.message }));
  }

  if (typeof result.data.signedUrl !== 'string') {
    return new Response(JSON.stringify({ message: 'Error in server' }));
  }

  const file = await fetch(result.data.signedUrl);

  if (!file.ok) {
    return new Response(JSON.stringify('There is file'));
  }

  return new Response(file.body, {
    status: 200,
    headers: {
      'Content-Type': file.headers.get('Content-Type') ?? '',
      'Cache-Control': 'public, max-age=60',
    },
  });
};
