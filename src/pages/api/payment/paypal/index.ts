import { paypalAuth, paypalCreateOrder } from '@/providers/paypal';
import {
  supabaseGetProduct,
  supabaseCreateOrderProduct,
  supabaseGetOrderProduct,
} from '@/providers/supabase';

import { AppError, responseError } from '@/utils/app-error';
import { supabaseAuthHelper } from '@/utils/supabase-auth-helper';

import type { APIRoute } from 'astro';

// Crear una compra
export const GET: APIRoute = async ({
  url,
  rewrite,
  locals,
  redirect,
  request,
  cookies,
}) => {
  const supabase = supabaseAuthHelper({ cookies, request });
  try {
    const idProduct = url.searchParams.get('id');
    if (idProduct == null) {
      throw AppError.badRequest('Missing id product').withEncrypted(false);
    }

    try {
      const order = await supabaseGetOrderProduct(
        supabase,
        locals.user?.id!,
        idProduct,
      );
      throw AppError.badRequest(
        order.approved
          ? 'You have already purchased this product!'
          : 'Payment for this product is being processed',
      ).withEncrypted(false);
    } catch (e) {
      // nothing to do
    }

    const product = await supabaseGetProduct(supabase, idProduct!);
    const price = product.price - product.discount;

    if (price <= 0) {
      throw AppError.badRequest(
        'This product cannot be purchased',
      ).withEncrypted(false);
    }

    const authData = await paypalAuth();
    const access_token = authData.access_token;

    const order = await paypalCreateOrder(
      access_token,
      locals.user?.id!,
      product.id,
      price,
    );

    const approveLink = order.links.find(({ rel }) => rel === 'approve')?.href;

    if (approveLink == null) {
      throw AppError.serverError(
        'Approve Link is not found in Paypal Response: ' +
          JSON.stringify(order),
      );
    }

    await supabaseCreateOrderProduct(
      supabase,
      locals.user?.id!,
      product.id,
      order.id,
      0,
    );

    return redirect(approveLink, 302);
  } catch (e) {
    return responseError(e, { rewrite, locals });
  }
};
