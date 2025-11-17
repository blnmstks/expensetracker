import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getCookie } from './cookie';

let csrfTokenCache: string | null = null;
let csrfRequestPromise: Promise<string | null> | null = null;

const csrfClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

const extractToken = (payload: any, headers?: Record<string, string | undefined>): string | null => {
  if (payload) {
    const tokenFromBody =
      payload?.csrfToken ||
      payload?.csrf_token ||
      payload?.csrf ||
      payload?.token;
    if (tokenFromBody) {
      return tokenFromBody;
    }
  }

  if (headers) {
    return (
      headers['x-csrftoken'] ||
      headers['x-csrf-token'] ||
      headers['X-CSRFToken'] ||
      headers['X-CSRF-Token'] ||
      null
    );
  }

  return null;
};

export const setCSRFToken = (token: string | null) => {
  csrfTokenCache = token ?? null;
};

export const getCSRFToken = (): string | null => {
  return csrfTokenCache || getCookie('csrftoken');
};

export const updateCSRFTokenFromResponse = (response?: AxiosResponse | null) => {
  if (!response) {
    return;
  }
  const headers = response.headers as Record<string, string | undefined> | undefined;
  if (!headers) {
    return;
  }
  const headerToken = extractToken(null, headers);
  if (headerToken) {
    setCSRFToken(headerToken);
  }
};

export const ensureCSRFToken = async (): Promise<string | null> => {
  const csrfFromCookie = getCookie('csrftoken');
  if (csrfFromCookie) {
    setCSRFToken(csrfFromCookie);
    return csrfFromCookie;
  }

  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  if (!csrfRequestPromise) {
    csrfRequestPromise = csrfClient
      .get('/csrf/')
      .then(({ data, headers }) => {
        const token = extractToken(data, headers as Record<string, string | undefined> | undefined);
        if (token) {
          setCSRFToken(token);
        }
        return token ?? null;
      })
      .catch((error) => {
        console.error('Не удалось получить CSRF токен', error);
        return null;
      })
      .finally(() => {
        csrfRequestPromise = null;
      });
  }

  return csrfRequestPromise;
};

export const attachCSRFFromConfig = (config: InternalAxiosRequestConfig) => {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['X-CSRFToken'] = csrfToken;
  }
};
