import { defineMiddleware, sequence } from 'astro:middleware';
import { checkJwtToken } from './providers/jwt';

const readJwtToken = defineMiddleware((context, next) => {
  const jwt = context.cookies.get('x-auth')?.value;
  if (jwt) {
    const payload = checkJwtToken(jwt);
    if (payload && typeof payload !== 'string' && payload.sub) {
      context.locals.user = {
        id: payload.sub,
        name: payload?.name,
        photo: payload?.photo,
      };
    }
  }

  return next();
});

const validateAccountPayment = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith('/api/payment')) {
    const user = context.locals.user;
    if (!user || !user.id) {
      const params = new URLSearchParams();
      params.append('href', context.url.href);
      return context.redirect('/login?' + params, 302);
    }
  }
  return next();
});

export const onRequest = sequence(readJwtToken, validateAccountPayment);
