import axiosInstance from '../lib/axios';
import { getCookie } from '../lib/cookie';

export async function ensureCSRFToken(): Promise<string | undefined> {
  const existingToken = getCookie('csrftoken');
  if (existingToken) {
    return existingToken;
  }

  const { data } = await axiosInstance.get('/csrf/');
  
  return data?.csrfToken;
}

// Улучшенный authAPI с автоматическим получением CSRF
export const authAPI = {
  // Проверить текущую сессию
  whoami: async () => {
    const response = await axiosInstance.get('/whoami/');
    return response.data;
  },

  login: async (email: string, password: string) => {
    // Ensure we have CSRF before POSTs
    await ensureCSRFToken();

    const csrf = getCookie('csrftoken') || '';

    try {
      const response = await axiosInstance.post('/auth/app/v1/auth/login', {
        email,
        password,
        flow: 'login',
      }, { headers: { 'X-CSRFToken': csrf } });

      return { success: true, data: response.data };
    } catch (error: any) {
      // Try to extract flows/session_token from error response (allauth headless behavior)
      const resp = error.response?.data || error.response || {};
      const flows = resp?.data?.flows || resp?.flows || [];
      const sessionToken = resp?.meta?.session_token || resp?.meta?.session_token;

      const needsVerification = Array.isArray(flows) && flows.some((f: any) => f.id === 'verify_email' && f.is_pending);

      if (error.response?.status === 401 && needsVerification) {
        return {
          success: false,
          requiresVerification: true,
          sessionToken,
          flows,
        };
      }

      // rethrow for other cases
      throw error;
    }
  },

  // Регистрация
  register: async (email: string, password: string) => {
    await ensureCSRFToken();

    const csrf = getCookie('csrftoken') || '';

    try {
      const response = await axiosInstance.post('/auth/app/v1/auth/signup', {
        email,
        password,
      }, { headers: { 'X-CSRFToken': csrf } });

      const respData = response.data || {};
      const flows = respData?.data?.flows || respData?.flows || [];
      const sessionToken = respData?.meta?.session_token;

      const needsVerification = Array.isArray(flows) && flows.some((f: any) => f.id === 'verify_email' && f.is_pending);

      if (needsVerification) {
        return {
          success: true,
          requiresVerification: true,
          sessionToken,
          flows,
          email,
        };
      }

      return { success: true, requiresVerification: false, data: respData };
    } catch (error: any) {
      const resp = error.response?.data || error.response || {};
      const flows = resp?.data?.flows || resp?.flows || [];
      const sessionToken = resp?.meta?.session_token;

      const needsVerification = Array.isArray(flows) && flows.some((f: any) => f.id === 'verify_email' && f.is_pending);

      if (error.response?.status === 401 && needsVerification) {
        return {
          success: false,
          requiresVerification: true,
          sessionToken,
          flows,
          email,
        };
      }

      throw error;
    }
  },

  logout: async () => {
    await axiosInstance.delete('/logout/');
    await ensureCSRFToken();
  },

  // Получить текущую сессию
  getSession: async () => {
    const response = await axiosInstance.get('/auth/session');
    return response.data;
  },

  // Google OAuth
  googleStart: async () => {
    const response = await axiosInstance.get('/auth/google/start');
    return response.data;
  },
};
