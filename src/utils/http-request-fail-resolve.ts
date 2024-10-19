import { AppError } from './app-error';

export const HttpRequestResolve = async (res: Response) => {
  if (res.ok) return;

  let headers = '';
  res.headers.forEach((key, value) => {
    headers += key + ': ' + value + '\n';
  });

  let body = '';
  try {
    body += await res.text();
  } catch (e) {
    body = '[Body Error] ';
    if (e instanceof Error) {
      body += e.message;
    }
  }

  throw AppError.serverError(res.statusText + '\n' + headers + body);
};
