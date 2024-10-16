import jwt, { type JwtPayload } from 'jsonwebtoken';

import { AppError } from '@/utils/app-error';

export const generateFreeJwtToken = (slug: string) => {
  if (import.meta.env.SECRET_JWT_FREE_SECRET === undefined)
    throw AppError.serverError('There is no free jwt secret');

  try {
    const token = jwt.sign(
      {
        validate: new Date().getTime() + 1000 * 15,
        slug,
      },
      import.meta.env.SECRET_JWT_FREE_SECRET,
      {
        expiresIn: '5m',
      },
    );

    return token;
  } catch (e) {
    throw AppError.serverError(
      'providers/jwt: There is a problem with the free token',
    );
  }
};

export const checkFreeJwtToken = (
  token: string,
): JwtPayload | string | null => {
  if (import.meta.env.SECRET_JWT_FREE_SECRET === undefined)
    throw AppError.serverError('providers/jwt: There is no FREE Jwt Secret');
  try {
    const decoded = jwt.verify(token, import.meta.env.SECRET_JWT_AUTH_SECRET);
    return decoded;
  } catch (e) {
    return null;
  }
};

export const generateJwtToken = (payload: {
  sub: string;
  roles: number;
  name?: string | null;
  photo?: string | null;
}): string => {
  if (import.meta.env.SECRET_JWT_AUTH_SECRET === undefined)
    throw AppError.serverError('There is no jwt secret');

  try {
    const token = jwt.sign(payload, import.meta.env.SECRET_JWT_AUTH_SECRET, {
      expiresIn: '30d',
    });
    return token;
  } catch (e) {
    throw AppError.serverError(
      'providers/jwt: There is a problem with the token',
    );
  }
};

export const checkJwtToken = (token: string): JwtPayload | string | null => {
  if (import.meta.env.SECRET_JWT_AUTH_SECRET === undefined)
    throw AppError.serverError('providers/jwt: There is no Jwt Secret');
  try {
    const decoded = jwt.verify(token, import.meta.env.SECRET_JWT_AUTH_SECRET);
    return decoded;
  } catch (e) {
    return null;
  }
};
