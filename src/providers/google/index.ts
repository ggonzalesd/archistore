import { OAuth2Client } from 'google-auth-library';

export const generateGoogleClient = () =>
  new OAuth2Client({
    clientId: import.meta.env.SECRET_GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.SECRET_GOOGLE_CLIENT_SECRET,
    redirectUri: import.meta.env.PUBLIC_HOST + '/api/auth/google/callback',
  });
