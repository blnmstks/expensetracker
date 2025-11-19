import axios from 'axios';
import { getCookie } from './cookie';
import { ensureCSRFToken, needsCSRF } from './csrf';


// Экземпляр axios с базовыми настройками
const axiosInstance = axios.create({
  // Используем относительный путь для работы через Vite proxy
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000, // 10 секунд
  headers: {
    'Content-Type': 'application/json',
  },
  // ВАЖНО: Для работы с Django Session Authentication
  withCredentials: true, // Отправляет cookies с каждым запросом
  xsrfCookieName: 'csrftoken', // Имя CSRF cookie в Django
  xsrfHeaderName: 'X-CSRFToken', // Имя CSRF заголовка
});

// Interceptor для добавления токена авторизации к каждому запросу
axiosInstance.interceptors.request.use(
  async (config) => {
    // Получаем session token из localStorage
    const token = localStorage.getItem('auth_token');

    if (token) {
      // Для django-allauth headless используем X-Session-Token
      config.headers['X-Session-Token'] = token;
    }

    if (needsCSRF(config.method) && !getCookie('csrftoken')) {
      await ensureCSRFToken();
    }

    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов и ошибок
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обработка различных типов ошибок
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const status = error.response.status;
      const data = error.response.data;
      
      console.error(`HTTP ${status}:`, data);
      
      switch (status) {
        case 401:
          console.error('❌ 401 Unauthorized: Требуется авторизация');
          localStorage.removeItem('auth_token');
          // Перенаправляем на страницу входа, если не на странице авторизации
          if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
            window.location.href = '/';
          }
          break;
        case 403:
          console.error('❌ 403 Forbidden: Доступ запрещен');
          break;
        case 404:
          console.error('❌ 404 Not Found: Endpoint не найден');
          console.error('URL:', error.config?.url);
          break;
        case 500:
          console.error('❌ 500 Server Error: Ошибка на сервере');
          break;
        default:
          console.error(`❌ ${status}:`, data);
      }
    } else if (error.request) {
      console.error('❌ Network Error: Нет ответа от сервера');
      console.error('Проверьте:');
      console.error('- Запущен ли бэкенд на', error.config?.baseURL);
      console.error('- Настроен ли CORS');
    } else {
      console.error('❌ Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
