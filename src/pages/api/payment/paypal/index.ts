import type { APIRoute } from 'astro';

// Crear una compra
export const GET: APIRoute = async (context) => {
  const order = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: '10.00',
        },
      },
    ],
    application_context: {
      brand_name: 'Archistore',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: import.meta.env.PUBLIC_HOST + '/api/payment/paypal/capture',
      cancel_url: import.meta.env.PUBLIC_HOST + '/api/payment/paypal/cancel',
    },
  };

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const authRes = await fetch(
    import.meta.env.SECRET_PAYPAL_API + '/v1/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          btoa(
            `${import.meta.env.SECRET_PAYPAL_ID}:${import.meta.env.SECRET_PAYPAL_SECRET}`,
          ),
      },
      body: params,
    },
  );
  const authData = await authRes.json();
  const access_token = authData.access_token;

  const orderRes = await fetch(
    import.meta.env.SECRET_PAYPAL_API + '/v2/checkout/orders',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + access_token,
      },
      body: JSON.stringify(order),
    },
  );
  const orderData = await orderRes.json();

  return new Response(JSON.stringify(orderData));
};
