import { paypalGetOrderInfo } from '@/providers/paypal';
import {
  supabaseGetOrderProduct,
  supabaseUpdateOrderProduct,
} from '@/providers/supabase';

import { AppError, responseError } from '@/utils/app-error';
import { supabaseAuthHelper } from '@/utils/supabase-auth-helper';

import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  try {
    const client_id = context.locals.user?.id!;
    const id = context.url.searchParams.get('id');

    if (id == null) {
      throw AppError.badRequest('Missing id product').withEncrypted(false);
    }

    const supabase = supabaseAuthHelper(context);
    const order = await supabaseGetOrderProduct(supabase, client_id, id);

    if (order.approved) {
      throw AppError.badRequest(
        'You have already purchased this product!',
      ).withEncrypted(false);
    }

    const info = await paypalGetOrderInfo(order.payment_id);

    if (info.status === 'COMPLETED') {
      await supabaseUpdateOrderProduct(
        supabase,
        client_id,
        order.product_id,
        true,
      );

      return context.redirect('/p/' + order.product_id, 302);
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
