import axiosInstance from '../lib/axios';
import { getCookie } from '../lib/cookie';

async function getAuthFlow() {
  try {
    // запрашиваем корень allauth headless — он вернёт либо 200, либо 401 с info о flows и session_token
    const res = await axiosInstance.get('/auth/app/v1/auth');
    return res.data;
  } catch (err: any) {
    // allauth часто отвечает 401 с телом { flows, meta: { session_token } }
    if (err.response?.data) return err.response.data;
    throw err;
  }
}

// Получить CSRF токен перед запросом
export async function ensureCSRFToken(): Promise<string | undefined> {
  const existingToken = getCookie('csrftoken');
  if (existingToken) {
    return existingToken;
  }

  try {
    const response = await axiosInstance.get('/auth/app/v1/config');

  // some backends return token in cookie, others in body - prefer cookie
  const tokenFromBody = response.data?.csrftoken || response.data;
  return tokenFromBody;
  } catch (error) {
    console.warn('⚠️ Не удалось получить CSRF токен:', error);
  }
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
    await ensureCSRFToken();
    try {
      const response = await axiosInstance.request({
        method: 'DELETE',
        url: '/auth/app/v1/auth/session',
      });
      return response.data;
    } catch (error: any) {
        console.log(`Error ${error}`);
    }
  },

  // Подтверждение email кодом
  verifyEmail: async (code: string, sessionToken: string) => {
    try {
      const response = await axiosInstance.post('/auth/app/v1/auth/verify_email', {
        code,
        session_token: sessionToken,
      }, {
        headers: {'X-CSRFToken': getCookie('csrftoken') || ''}
      });
      
      console.log('✅ Email подтвержден:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('⚠️ Ошибка верификации:', error);
      throw error;
    }
  },

  // Переслать код верификации
  resendVerificationCode: async (email: string) => {
    try {
      const response = await axiosInstance.post('/auth/app/v1/auth/request_email_verification_code', {
        email,
      });
      console.log('✅ Код верификации отправлен повторно');
      return response.data;
    } catch (error: any) {
      console.error('⚠️ Ошибка отправки кода:', error);
      throw error;
    }
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
