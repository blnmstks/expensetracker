import axiosInstance from '../lib/axios';
import { Category, CurrencyRatePayload, Expense } from '../types';

// Экспортируем authAPI из отдельного файла
export { authAPI } from './authAPI';

// API сервисы для работы с расходами
export const expenseAPI = {
  // Получить все расходы
  getAll: async () => {
    const response = await axiosInstance.get<Expense[]>('/expenses/');
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
  getByPeriod: async (date_from: string, date_to: string) => {
    const response = await axiosInstance.get<Expense[]>('/expenses/', {
      params: { date_from, date_to },
    });
    return response.data;
  },

  // Получить расходы по категории
  getByCategory: async (categoryId: string) => {
    const response = await axiosInstance.get<Expense[]>(`/expenses/category/${categoryId}/`);
    return response.data;
  },

  // Получить ежемесячные расходы по категориям
  categoryMontlyExpenses: async () => {
    const response = await axiosInstance.get('/expenses/category_monthly/');
    return response.data;
  }
};

// API сервисы для работы с категориями
export const categoryAPI = {
  getAll: async () => {
    const response = await axiosInstance.get<Category[]>('/categories/');
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
  getAll: async () => {
    const response = await axiosInstance.get('/currencies/');
    return response.data;
  },

  getDefaultCurrency: async () => {
    const response = await axiosInstance.get('/currencies/default/');
    return response.data;
  },

  setDefaultCurrency: async (id: number) => {
    const response = await axiosInstance.post('/currencies/set-default/', {
      currency: id,
    });
    return response.data;
  },

  setCurrencyActiveStatus: async (id: number, is_active: boolean) => {
    const response = await axiosInstance.post(`/currencies/${id}/set-active/`, {
      is_active,
    });
    return response.data;
  },

  setCurrencyRates: async (rates: CurrencyRatePayload[]) => {
    const response = await axiosInstance.post('/currencies/bulk-update-rates/', {
      currencies: rates,
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
