import { paypalAuth, paypalCreateOrder } from '@/providers/paypal';
import {
  supabaseGetProduct,
  supabaseCreateOrderProduct,
} from '@/providers/supabase';
import { AppError, responseError } from '@/utils/app-error';
import type { APIRoute } from 'astro';

// Crear una compra
export const GET: APIRoute = async ({ url, rewrite, locals, redirect }) => {
  try {
    const idProduct = url.searchParams.get('id');

    const product = await supabaseGetProduct(idProduct!);

    const authData = await paypalAuth();
    const access_token = authData.access_token;

    const order = await paypalCreateOrder(
      access_token,
      locals.user?.id!,
      product.id,
      product.price,
    );

    const approveLink = order.links.find(({ rel }) => rel === 'approve')?.href;

    if (approveLink == null) {
      throw AppError.serverError(
        'Approve Link is not found in Paypal Response: ' +
          JSON.stringify(order),
      );
    }

    const orderProduct = await supabaseCreateOrderProduct(
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
