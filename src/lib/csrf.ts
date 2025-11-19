import axios from 'axios';
import { getCookie } from './cookie';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']);

let csrfRequest: Promise<string | undefined> | null = null;
let cachedToken: string | undefined;

const resolveTokenFromResponse = (data: any) =>
  data?.csrfToken || data?.csrf_token || data?.token || undefined;

const fetchCSRFToken = async (): Promise<string | undefined> => {
  const { data } = await axios.get(`${API_BASE}/csrf/`, {
    withCredentials: true,
  });

  const tokenFromCookie = getCookie('csrftoken') || undefined;
  const token = tokenFromCookie || resolveTokenFromResponse(data);

  if (token) {
    cachedToken = token;
  }

  return token;
};

export const getCSRFToken = (): string | undefined => {
  return getCookie('csrftoken') || cachedToken;
};

export const ensureCSRFToken = async (): Promise<string | undefined> => {
  const existing = getCSRFToken();
  if (existing) {
    return existing;
  }

  if (!csrfRequest) {
    csrfRequest = fetchCSRFToken().finally(() => {
      csrfRequest = null;
    });
  }

  return csrfRequest;
};

export const needsCSRF = (method?: string) => {
  const normalized = (method || 'get').toLowerCase();
  return !SAFE_METHODS.has(normalized);
};
