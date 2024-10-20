import { paypalGetOrderInfo } from '@/providers/paypal';
import { supabaseUpdateOrderProduct } from '@/providers/supabase';

import { AppError, responseError } from '@/utils/app-error';
import { HttpRequestResolve } from '@/utils/http-request-fail-resolve';
import { supabaseAuthHelper } from '@/utils/supabase-auth-helper';
import { zodParseResolve } from '@/utils/zod-parse-resolver';

import { paypalCheckoutInfoSchema } from '@/schema/paypal.schema';

import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const token = context.url.searchParams.get('token');
  const supabase = supabaseAuthHelper(context);

  try {
    const order = await paypalGetOrderInfo(token!);
    if (order.status === 'COMPLETED') {
      return context.redirect(
        '/api/payment/validate?id=' + order.purchase_units[0].reference_id,
        302,
      );
    }

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
    await HttpRequestResolve(response);
    const json = await response.json();
    const parsed = paypalCheckoutInfoSchema.safeParse(json);
    const info = zodParseResolve(parsed);

    if (info.status === 'COMPLETED') {
      await supabaseUpdateOrderProduct(
        supabase,
        context.locals.user?.id!,
        info.purchase_units[0].reference_id!,
        true,
      );

      return context.redirect('/', 302);
    }

    const payUrl = info.links.find(({ rel }) => rel === 'approve');

    if (payUrl == null) {
      throw AppError.serverError(JSON.stringify(info));
    }

    return context.redirect(payUrl.href, 302);
  } catch (e) {
    return responseError(e, context);
  }
};
