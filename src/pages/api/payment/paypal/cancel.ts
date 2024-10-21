import { paypalGetOrderInfo } from '@/providers/paypal';
import { supabaseGetOrderProduct } from '@/providers/supabase';
import { AppError, responseError } from '@/utils/app-error';
import { supabaseAuthHelper } from '@/utils/supabase-auth-helper';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const token = context.url.searchParams.get('token');

  const order = await paypalGetOrderInfo(token!);

  const client_id = context.locals.user?.id!;
  const product_id = order.purchase_units[0].reference_id;

  try {
    const supabase = supabaseAuthHelper(context);
    const orderProduct = await supabaseGetOrderProduct(
      supabase,
      client_id,
      product_id,
    );

    if (orderProduct.approved) {
      throw AppError.badRequest('This order is already approved');
    }

    if (orderProduct.payment_id === order.id) {
      const { error } = await supabase
        .from('client_products')
        .delete()
        .eq('payment_id', order.id)
        .eq('client_id', client_id)
        .eq('product_id', product_id);

      if (error) {
        throw AppError.serverError(error.message);
      }

      return context.redirect('/', 302);
    }

    throw AppError.serverError('Error in Payment Validation');
  } catch (e) {
    return responseError(e, context);
  }
};
