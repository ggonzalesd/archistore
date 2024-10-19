import {
  paypalAuthSchema,
  paypalCreateResponseSchema,
} from '@/schema/paypal.schema';
import { HttpRequestResolve } from '@/utils/http-request-fail-resolve';
import { zodParseResolve } from '@/utils/zod-parse-resolver';

export const paypalAuth = async () => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const response = await fetch(
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
  await HttpRequestResolve(response);

  const json = await response.json();
  const parsed = paypalAuthSchema.safeParse(json);

  return zodParseResolve(parsed);
};

export const paypalCreateOrder = async (
  access_token: string,
  userId: string,
  productId: string,
  price: number,
) => {
  const order: IPaypalCreate = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: productId,
        custom_id: userId,
        amount: {
          currency_code: 'USD',
          value: parseFloat(`${price / 100}`).toFixed(2),
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

  const response = await fetch(
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
  await HttpRequestResolve(response);

  const json = await response.json();
  const parsed = paypalCreateResponseSchema.safeParse(json);

  return zodParseResolve(parsed);
};
