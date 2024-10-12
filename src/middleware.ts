import { defineMiddleware } from 'astro:middleware';
import { checkJwtToken } from './providers/jwt';

export const onRequest = defineMiddleware((context, next) => {
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
