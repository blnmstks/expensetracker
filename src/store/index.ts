import { create } from 'zustand';
import { categoryAPI, currencyAPI, expenseAPI } from '../services/api';
import { Category, Currency, Expense } from '../types';

type CategoriesStore = {
  categories: Category[];
  fetchCategories: () => Promise<void>;
};

type ExpensesStore = {
  expenses: Expense[];
  categoryMonthlyExpenses: any;
  fetchExpenses: () => Promise<void>;
  fetchCategoryMonthlyExpenses: () => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
};

type CurrencyStore = {
  currency: Currency[];
  fetchCurrency: () => Promise<void>;
};  

export const useCategories = create<CategoriesStore>((set) => ({
  categories: [],
  fetchCategories: async () => {
    const data = await categoryAPI.getAll();
    set({ categories: data });
  },
}));


export const useExpenses = create<ExpensesStore>((set) => ({
  expenses: [],
  categoryMonthlyExpenses: {},

  fetchExpenses: async () => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0).toISOString();
    const end = new Date().toISOString();
    const data = await expenseAPI.getByPeriod();
    set({ expenses : data });
  },

  deleteExpense: async (id) => {
    await expenseAPI.delete(String(id));
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
    }));
  },

  fetchCategoryMonthlyExpenses: async () => {
    const data = await expenseAPI.categoryMontlyExpenses();
    set({ categoryMonthlyExpenses: data });
  },
}));

export const useCurrency = create<CurrencyStore>((set) => ({
  currency: [],
  fetchCurrency: async () => {
    const data = await currencyAPI.getAll();
    set({ currency: data });
  },
}));
