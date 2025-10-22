import axiosInstance from '../lib/axios';
import type { Expense, Category, CurrencySettings } from '../App';

// API сервисы для работы с расходами
export const expenseAPI = {
  // Получить все расходы
  getAll: async () => {
    const response = await axiosInstance.get<Expense[]>('/expenses/');
    console.log('Fetched expenses from API:', response.data);
    return response.data;
  },

  // Получить расход по ID
  getById: async (id: string) => {
    const response = await axiosInstance.get<Expense>(`/expenses/${id}/`);
    return response.data;
  },

  // Создать новый расход
  create: async (expense: Omit<Expense, 'id'>) => {
    const response = await axiosInstance.post<Expense>('/expenses/', expense);
    return response.data;
  },

  // Обновить расход
  update: async (id: string, expense: Partial<Expense>) => {
    const response = await axiosInstance.put<Expense>(`/expenses/${id}/`, expense);
    return response.data;
  },

  // Удалить расход
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/expenses/${id}/`);
    return response.data;
  },

  // Получить расходы по периоду
  getByPeriod: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get<Expense[]>('/expenses/period/', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Получить расходы по категории
  getByCategory: async (categoryId: string) => {
    const response = await axiosInstance.get<Expense[]>(`/expenses/category/${categoryId}/`);
    return response.data;
  },
};

// API сервисы для работы с категориями
export const categoryAPI = {
  // Получить все категории
  getAll: async () => {
    const response = await axiosInstance.get<Category[]>('/categories/');
    return response.data;
  },

  // Получить категорию по ID
  getById: async (id: string) => {
    const response = await axiosInstance.get<Category>(`/categories/${id}/`);
    return response.data;
  },

  // Создать новую категорию
  create: async (category: Omit<Category, 'id'>) => {
    const response = await axiosInstance.post<Category>('/categories/', category);
    return response.data;
  },

  // Обновить категорию
  update: async (id: string, category: Partial<Category>) => {
    const response = await axiosInstance.put<Category>(`/categories/${id}/`, category);
    return response.data;
  },

  // Удалить категорию
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/categories/${id}/`);
    return response.data;
  },
};

// API сервисы для работы с настройками валют
export const currencyAPI = {
  // Получить настройки валют
  getSettings: async () => {
    const response = await axiosInstance.get<CurrencySettings>('/currency/settings/');
    return response.data;
  },

  // Обновить настройки валют
  updateSettings: async (settings: CurrencySettings) => {
    const response = await axiosInstance.put<CurrencySettings>('/currency/settings/', settings);
    return response.data;
  },

  // Получить актуальные курсы валют
  getExchangeRates: async (baseCurrency: string) => {
    const response = await axiosInstance.get<Record<string, number>>('/currency/rates/', {
      params: { base: baseCurrency },
    });
    return response.data;
  },
};

// API сервисы для аналитики
export const analyticsAPI = {
  // Получить статистику по категориям за период
  getCategoryStats: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/analytics/categories/', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Получить общую статистику
  getOverallStats: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/analytics/overall/', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Получить тренды расходов
  getTrends: async (period: 'week' | 'month' | 'year') => {
    const response = await axiosInstance.get('/analytics/trends/', {
      params: { period },
    });
    return response.data;
  },
};

// API сервисы для аутентификации (если понадобится)
export const authAPI = {
  // Вход
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login/', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  // Регистрация
  register: async (email: string, password: string, name: string) => {
    const response = await axiosInstance.post('/auth/register/', { email, password, name });
    return response.data;
  },

  // Выход
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout/');
    localStorage.removeItem('authToken');
    return response.data;
  },

  // Получить текущего пользователя
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me/');
    return response.data;
  },
};
