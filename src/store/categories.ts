import { create } from 'zustand';
import type { Category, Expense } from '../App';
import { categoryAPI, expenseAPI } from '../services/api';

type CategoriesStore = {
  categories: Category[];
  fetchCategories: () => Promise<void>;
};

type ExpensesStore = {
  expenses: Expense[];
  fetchExpenses: () => Promise<void>;
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
  fetchExpenses: async () => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0).toISOString();
    const end = new Date().toISOString();
    const data = await expenseAPI.getByPeriod();
    set({ expenses : data });
  },
}));