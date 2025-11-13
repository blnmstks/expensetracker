const DEFAULT_BASE_URL = '/api';
const PROD_FALLBACK_URL = 'https://jem-tracker.space/api';

export const resolveApiBaseURL = (): string => {
  const envURL = import.meta.env.VITE_API_URL;
  let baseURL = envURL && envURL.trim().length ? envURL : DEFAULT_BASE_URL;

  if (baseURL === DEFAULT_BASE_URL && typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return DEFAULT_BASE_URL;
    }

    if (hostname.endsWith('.vercel.app')) {
      return PROD_FALLBACK_URL;
    }
  }

  return baseURL;
};
