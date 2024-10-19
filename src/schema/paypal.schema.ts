import { z } from 'astro:schema';

export const paypalAuthSchema = z.object({
  scope: z.string(),
  access_token: z.string(),
  token_type: z.string(),
  app_id: z.string(),
  expires_in: z.number(),
  nonce: z.string(),
});

export const paypalCreateResponseSchema = z.object({
  id: z.string(),
  status: z.enum([
    'CREATED',
    'SAVED',
    'APPROVED',
    'VOIDED',
    'COMPLETED',
    'PAYER_ACTION_REQUIRED',
  ]),
  links: z.array(
    z.object({
      href: z.string(),
      rel: z.string(),
      method: z
        .enum(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])
        .optional()
        .nullable(),
    }),
  ),
});
