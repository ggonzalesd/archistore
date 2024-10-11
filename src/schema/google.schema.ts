import { z } from 'astro:schema';

export const googleUserInfoSchema = z.object({
  sub: z.string(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().optional(),
  email: z.string().optional(),
  email_verified: z.boolean().optional(),
});
