import { OAuth2Client } from 'google-auth-library';

export const generateGoogleClient = () =>
  new OAuth2Client({
    clientId: import.meta.env.SECRET_GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.SECRET_GOOGLE_CLIENT_SECRET,
    redirectUri: import.meta.env.PUBLIC_HOST + '/api/auth/google/callback',
  });

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
