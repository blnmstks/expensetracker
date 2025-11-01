import { create } from 'zustand';
import { categoryAPI, currencyAPI, expenseAPI } from '../services/api';
import { Category, CategoryIcon, Currency, CurrencyRatePayload, Expense } from '../types';

type CategoriesStore = {
  categories: Category[];
  categoryIcons: CategoryIcon[];

  fetchCategoryIcons: () => Promise<void>;
  updateCategoryIcon: (id: number, icon: string) => Promise<void>;

  fetchCategories: () => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
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
  defaultCurrency: number;

  fetchCurrency: () => Promise<void>;
  fetchDefaultCurrency: () => Promise<void>;
  setDefaultCurrency: (id: number) => Promise<void>;
  setCurrencyActiveStatus: (id: number, is_active: boolean) => Promise<void>;
  setCurrencyRates: (rates: CurrencyRatePayload[]) => Promise<void>;
};

export const useCategories = create<CategoriesStore>((set) => ({
  categories: [],
  categoryIcons: [],
  
  
  fetchCategoryIcons: async () => {
    const data = await categoryAPI.categoryEmojiList();
    set({ categoryIcons: data });
  },
  fetchCategories: async () => {
    const data = await categoryAPI.getAll();
    set({ categories: data });
  },

  deleteCategory: async (id: number) => {
    await categoryAPI.delete(id);
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    }));
  },

  updateCategoryIcon: async (id: number, icon: string) => {
    const data = await categoryAPI.updateCategoryIcon(id, icon);
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? { ...category, icon: data.icon } : category
      ),
    }));
  }
}));


export const useExpenses = create<ExpensesStore>((set) => ({
  expenses: [],
  categoryMonthlyExpenses: {},

  fetchExpenses: async () => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0).toISOString();
    const end = new Date().toISOString();
    const data = await expenseAPI.getByPeriod();
    const sorted = [...data].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    set({ expenses: sorted });
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
  defaultCurrency: 1,

  fetchCurrency: async () => {
    const data = await currencyAPI.getAll();
    set({ currency: data });
  },

  fetchDefaultCurrency: async () => {
    const data = await currencyAPI.getDefaultCurrency();
    set({ defaultCurrency: data.id });
  },

  setDefaultCurrency: async (id: number) => {
    const data = await currencyAPI.setDefaultCurrency(id);
    set({ defaultCurrency: id });
  },

  setCurrencyActiveStatus: async (id: number, is_active: boolean) => {
    const data = await currencyAPI.setCurrencyActiveStatus(id, is_active);
    set((state) => ({
      currency: state.currency.map((curr) =>
        curr.id === id ? { ...curr, is_active } : curr
      ),
    }));
  },

  setCurrencyRates: async (rates: CurrencyRatePayload[]) => {
    await currencyAPI.setCurrencyRates(rates);
    set((state) => ({
      currency: state.currency.map((curr) => {
        const updatedRate = rates.find((rate) => rate.id === curr.id);
        if (!updatedRate) {
          return curr;
        }

        return {
          ...curr,
          rate: updatedRate.rate,
        };
      }),
    }));
  },
}));
