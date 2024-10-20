import { z } from 'astro:schema';

import {
  supaOrderSchema,
  supaProductsInfoSchema,
  supaUserInfoSchema,
} from '@/schema/supabase.schema';

import { AppError } from '@/utils/app-error';
import { zodParseResolve } from '@/utils/zod-parse-resolver';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

const formatError = (e: PostgrestError) => {
  return `Supabase Error\nCode: ${e.code}\nMessage: ${e.message}\nHint: ${e.hint}\nDetails: ${e.details}`;
};

type SupabaseServerClient = SupabaseClient<any, 'public', any>;

const supabaseGetOne = async (
  supabase: SupabaseServerClient,
  table: string,
  attribs: Record<string, string>,
  message?: string | null,
  throwable: boolean = true,
) => {
  let promise = supabase.from(table).select('*').limit(1);
  Object.entries(attribs).forEach(([key, value]) => {
    promise = promise.eq(key, value);
  });
  const response = await promise;

  if (response.error) {
    if (throwable) throw AppError.serverError(formatError(response.error));
    return null;
  }
  if (!response.data || response.data.length < 1) {
    if (throwable)
      throw AppError.notFound(message ?? 'Resource not found!').withEncrypted(
        false,
      );
    return null;
  }

  return response.data[0] as unknown;
};

const supabaseCreateOne = async (
  supabase: SupabaseServerClient,
  table: string,
  payload: unknown,
) => {
  const response = await supabase.from(table).insert([payload]).select();
  if (response.error) throw AppError.serverError(response.error.message);

  return response.data[0]! as unknown;
};

// ---------------------------------------------------------------

// Get one product per product and client
export const supabaseGetOrderProduct = async (
  supabase: SupabaseServerClient,
  client_id: string,
  product_id: string,
) => {
  const order = await supabaseGetOne(supabase, 'client_products', {
    client_id,
    product_id,
  });

  const parsed = supaOrderSchema.safeParse(order);

  return zodParseResolve(parsed)!;
};

// Create on order per product and client
export const supabaseCreateOrderProduct = async (
  supabase: SupabaseServerClient,
  client_id: string,
  product_id: string,
  payment_id: string,
  method: number,
) => {
  const payloadOrder = {
    client_id,
    product_id,
    payment_id,
    method,
  };
  const order = await supabaseCreateOne(
    supabase,
    'client_products',
    payloadOrder,
  );

  const parsed = supaOrderSchema.safeParse(order);

  return zodParseResolve(parsed);
};

export const supabaseGetProduct = async (
  supabase: SupabaseServerClient,
  slug: string,
) => {
  const productResponse = await supabaseGetOne(
    supabase,
    'products',
    { id: slug },
    `Product ${slug} not found!`,
  );

  const parsed = supaProductsInfoSchema.safeParse(productResponse);

  return zodParseResolve(parsed)!;
};

export const supabaseGetProducts = async (
  supabase: SupabaseServerClient,
  start: number,
  end: number,
) => {
  const products = await supabase
    .from('products')
    .select('*')
    .range(start, end);

  if (products.error || !products.data) {
    throw AppError.serverError(formatError(products.error));
  }

  const parsed = z.array(supaProductsInfoSchema).safeParse(products.data);

  return zodParseResolve(parsed);
};
