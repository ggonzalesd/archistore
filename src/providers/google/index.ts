import { AppError } from '@/utils/app-error';
import {
  LoginTicket,
  OAuth2Client,
  type Credentials,
} from 'google-auth-library';

export const generateGoogleClient = () =>
  new OAuth2Client({
    clientId: import.meta.env.SECRET_GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.SECRET_GOOGLE_CLIENT_SECRET,
    redirectUri: import.meta.env.PUBLIC_HOST + '/api/auth/google/callback',
  });

export const getFromCode = async (code: string | null) => {
  if (!code) {
    throw AppError.badRequest('Authorization code not found');
  }

  // Check if the 'code' is valid
  const google = generateGoogleClient();

  let tokens: Credentials | null = null;
  try {
    const tokenRes = await google.getToken(code);
    tokens = tokenRes.tokens;
  } catch (e) {
    throw AppError.unauthorized('Authorization code not allowed!');
  }

  google.setCredentials(tokens);
  if (tokens.id_token == null || tokens.access_token == null) {
    throw AppError.unauthorized('Authorization id token missing');
  }

  // Get Login ticket
  let ticket: LoginTicket | null = null;
  try {
    ticket = await google.verifyIdToken({
      idToken: tokens.id_token,
      audience: import.meta.env.SECRET_GOOGLE_CLIENT_ID,
    });
  } catch (e) {
    throw AppError.unauthorized('Error Verifying ID Token!');
  }

  const payload = ticket.getPayload();
  const userid = payload?.sub;

  if (payload == null || userid == null) {
    throw AppError.serverError('There is a problem with payload');
  }

  return payload;
};

export const createLoginUrl = (google: OAuth2Client, state: string | null) => {
  const url = google.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ],
    prompt: 'consent',
    state: state ?? undefined,
  });

  return url;
};
