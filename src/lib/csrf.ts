import axios from 'axios';
import { getCookie } from './cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let csrfTokenCache: string | null = null;

const csrfClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const extractToken = (data: any): string | null => {
  return (
    data?.csrfToken ||
    data?.csrf_token ||
    data?.csrf ||
    data?.token ||
    null
  );
};

export const setCSRFToken = (token: string | null) => {
  csrfTokenCache = token ?? null;
};

export const getCSRFToken = (): string | null => {
  return csrfTokenCache || getCookie('csrftoken');
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

  try {
    const { data } = await csrfClient.get('/csrf/');
    const token = extractToken(data);
    if (token) {
      setCSRFToken(token);
    }
    return token;
  } catch (error) {
    console.error('Не удалось получить CSRF токен', error);
    return null;
  }
};
