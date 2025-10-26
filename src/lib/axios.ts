import axios from 'axios';
import { getCookie } from './cookie';


// Экземпляр axios с базовыми настройками
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
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
  (config) => {
    // Получаем JWT токен из localStorage, если он есть
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Для Django Session Auth: добавляем CSRF токен
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
          localStorage.removeItem('authToken');
          break;
        case 403:
          console.error('❌ 403 Forbidden: Доступ запрещен');
          console.error('Возможные причины:');
          console.error('- Отсутствует CSRF токен');
          console.error('- CORS не настроен на бэкенде');
          console.error('- Нужна сессия/авторизация');
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

// Функция для получения CSRF токена с сервера
export const fetchCSRFToken = async (): Promise<void> => {
  try {
    // Django обычно отдаёт CSRF токен при первом запросе
    // Можно сделать запрос на любой safe endpoint (GET)
    await axiosInstance.get('/csrf/', { 
      withCredentials: true 
    });
    console.log('✅ CSRF токен получен');
  } catch (error) {
    console.warn('⚠️ Не удалось получить CSRF токен:', error);
    // Не критично, продолжаем работу
  }
};

export default axiosInstance;
