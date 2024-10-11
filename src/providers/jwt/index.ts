import jwt, { type JwtPayload } from 'jsonwebtoken';

export const generateJwtToken = (payload: {
  sub: string;
  roles: number;
}): string | null => {
  if (import.meta.env.SECRET_JWT_AUTH_SECRET === undefined)
    throw new Error('There is no jwt secret');

  try {
    const token = jwt.sign(payload, import.meta.env.SECRET_JWT_AUTH_SECRET, {
      expiresIn: '30d',
    });
    return token;
  } catch (e) {
    return null;
  }
};

export const checkJwtToken = (token: string): JwtPayload | string | null => {
  if (import.meta.env.SECRET_JWT_AUTH_SECRET === undefined)
    throw new Error('There is no jwt secret');
  try {
    const decoded = jwt.verify(token, import.meta.env.SECRET_JWT_AUTH_SECRET);
    return decoded;
  } catch (e) {
    return null;
  }
};
