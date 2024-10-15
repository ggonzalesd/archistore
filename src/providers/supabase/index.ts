import { createClient, type PostgrestError } from '@supabase/supabase-js';
import { z } from 'astro:schema';

import {
  supaProductsInfoSchema,
  supaUserInfoSchema,
} from '@/schema/supabase.schema';

import { AppError } from '@/utils/app-error';

const supabaseUrl = import.meta.env.SECRET_SUPABASE_URL;
const supabaseKey = import.meta.env.SECRET_SUPABASE_SECRET;
export const supabase = createClient(supabaseUrl, supabaseKey);

const formatError = (e: PostgrestError) => {
  return `Supabase Error\nCode: ${e.code}\nMessage: ${e.message}\nHint: ${e.hint}\nDetails: ${e.details}`;
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

  if (!parsed.success) {
    const errorMessages = parsed.error.issues
      .map((issue) => issue.message)
      .join(', ');
    throw AppError.serverError('Parse error: ' + errorMessages);
  }

  return parsed.data;
};

export const supabaseGetUser = async (userid?: string) => {
  const supaUser = await supabase
    .from('clients')
    .select('*')
    .eq('user_code', userid)
    .limit(1);

  if (supaUser.error) {
    throw AppError.serverError(formatError(supaUser.error));
  }

  if (supaUser.data.length < 1) return null;

  const { data, error } = supaUserInfoSchema.safeParse(supaUser.data[0]);
  if (error) {
    const errorMessages = error.issues.map((issue) => issue.message).join(', ');
    throw AppError.serverError('Parse error: ' + errorMessages);
  }

  return data;
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

  const { data, error } = supaUserInfoSchema.safeParse(supaRes.data[0]);
  if (error) {
    const errorMessages = error.issues.map((issue) => issue.message).join(', ');
    throw AppError.serverError('Parse error: ' + errorMessages);
  }

  return data;
};
