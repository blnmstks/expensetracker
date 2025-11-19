import axios from 'axios';
import { getCookie } from './cookie';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']);

let csrfRequest: Promise<string | undefined> | null = null;

const fetchCSRFToken = async (): Promise<string | undefined> => {
  await axios.get(`${API_BASE}/csrf/`, {
    withCredentials: true,
  });
  return getCookie('csrftoken') || undefined;
};

export const ensureCSRFToken = async (): Promise<string | undefined> => {
  const existing = getCookie('csrftoken');
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
