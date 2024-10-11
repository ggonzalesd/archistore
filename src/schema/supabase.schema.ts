import { z } from 'astro:schema';

export const supaUserInfoSchema = z.object({
  id: z.string(),
  created_at: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: 'La fecha no es válida',
    })
    .transform((value) => new Date(value)),
  user_code: z.string(),
  display: z.string().optional(),
  photo: z.string().optional(),
  email: z.string().optional(),
  active: z.boolean(),
  roles: z.number(),
});
