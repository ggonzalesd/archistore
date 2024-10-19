import { z } from 'astro:schema';

const dateSchema = z
  .string()
  .refine((value) => !isNaN(Date.parse(value)), {
    message: 'La fecha no es válida',
  })
  .transform((value) => new Date(value));

export const supaOrderSchema = z.object({
  client_id: z.string(),
  product_id: z.string(),
  approved: z.boolean(),
  method: z.number(), // 0 paypal
  payment_id: z.string(),
  created_at: dateSchema,
});

export const supaUserInfoSchema = z.object({
  id: z.string(),
  created_at: dateSchema,
  user_code: z.string(),
  display: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  email: z.string().optional(),
  active: z.boolean(),
  roles: z.number(),
  key: z.string().optional().nullable(),
  verified: z.boolean(),
});

export const supaProductsInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  currency: z.enum(['PEN']),
  description: z.string(),
  price: z.number().int().nonnegative(),
  photos: z.number(),
  discount: z.number().int().min(0).max(100),
  status: z.number().int().min(0),
  created_at: dateSchema,
  discount_end: dateSchema.optional().nullable(),
  tags: z.string().optional().nullable(),
});
