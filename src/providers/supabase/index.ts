import { createClient, type PostgrestError } from '@supabase/supabase-js';
import { z } from 'astro:schema';

import {
  supaOrderSchema,
  supaProductsInfoSchema,
  supaUserInfoSchema,
} from '@/schema/supabase.schema';

import { AppError } from '@/utils/app-error';
import { zodParseResolve } from '@/utils/zod-parse-resolver';

const supabaseUrl = import.meta.env.SECRET_SUPABASE_URL;
const supabaseKey = import.meta.env.SECRET_SUPABASE_SECRET;
export const supabase = createClient(supabaseUrl, supabaseKey);

const formatError = (e: PostgrestError) => {
  return `Supabase Error\nCode: ${e.code}\nMessage: ${e.message}\nHint: ${e.hint}\nDetails: ${e.details}`;
};

const supabaseGetOne = async (
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

const supabaseCreateOne = async (table: string, payload: unknown) => {
  const response = await supabase.from(table).insert([payload]).select();
  if (response.error) throw AppError.serverError(response.error.message);

  return response.data[0]! as unknown;
};

// ---------------------------------------------------------------

// Get one product per product and client
export const supabaseGetOrderProduct = async (
  client_id: string,
  product_id: string,
) => {
  const order = await supabaseGetOne('client_products', {
    client_id,
    product_id,
  });

  const parsed = supaOrderSchema.safeParse(order);

  return zodParseResolve(parsed)!;
};

// Create on order per product and client
export const supabaseCreateOrderProduct = async (
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
  const order = await supabaseCreateOne('client_products', payloadOrder);

  const parsed = supaOrderSchema.safeParse(order);

  return zodParseResolve(parsed);
};

export const supabaseGetProduct = async (slug: string) => {
  const productResponse = await supabaseGetOne(
    'products',
    { id: slug },
    `Product ${slug} not found!`,
  );

  const parsed = supaProductsInfoSchema.safeParse(productResponse);

  return zodParseResolve(parsed)!;
};

export const supabaseGetProducts = async (start: number, end: number) => {
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

export const supabaseGetUser = async (userid?: string) => {
  if (userid == null) return null;

  const user = await supabaseGetOne(
    'clients',
    { user_code: userid },
    `User not found!`,
    false,
  );

  if (user == null) return user;

  const parsed = supaUserInfoSchema.safeParse(user);

  return zodParseResolve(parsed);
};

export const supabaseCreateUser = async (
  user_code: string,
  display?: string | null,
  photo?: string | null,
  email?: string | null,
) => {
  const newUser = {
    user_code,
    display,
    photo,
    email,
  };

  const supaRes = await supabase.from('clients').insert([newUser]).select();
  if (supaRes.error) throw AppError.serverError(supaRes.error.message);

  const parsed = supaUserInfoSchema.safeParse(supaRes.data[0]);

  return zodParseResolve(parsed);
};
