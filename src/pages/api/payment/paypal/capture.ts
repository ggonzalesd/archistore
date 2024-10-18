import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const token = context.url.searchParams.get('token');

  const response = await fetch(
    import.meta.env.SECRET_PAYPAL_API +
      '/v2/checkout/orders/' +
      token +
      '/capture',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          btoa(
            `${import.meta.env.SECRET_PAYPAL_ID}:${import.meta.env.SECRET_PAYPAL_SECRET}`,
          ),
      },
    },
  );
  const data = await response.json();

  return new Response(JSON.stringify(data));
};
