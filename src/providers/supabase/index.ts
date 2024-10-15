import { supaUserInfoSchema } from '@/schema/supabase.schema';
import { AppError } from '@/utils/app-error';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SECRET_SUPABASE_URL;
const suapbaseKey = import.meta.env.SECRET_SUPABASE_SECRET;
export const supabase = createClient(supabaseUrl, suapbaseKey);

export const supabaseGetUser = async (userid?: string) => {
  const supaUser = await supabase
    .from('clients')
    .select('*')
    .eq('user_code', userid)
    .limit(1);

  if (supaUser.error) {
    throw AppError.serverError('There is a problem with our services');
  }

  if (supaUser.data.length < 1) return null;

  const { data, error } = supaUserInfoSchema.safeParse(supaUser.data[0]);
  if (error) {
    throw AppError.serverError('Database is having problems');
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
    throw AppError.unauthorized('Database is having problems');
  }

  return data;
};
