import { create } from 'zustand';
import type { Category } from '../App';
import { categoryAPI } from '../services/api';

type CategoriesStore = {
  categories: Category[];
  fetchCategories: () => Promise<void>;
};

export const useCategories = create<CategoriesStore>((set) => ({
  categories: [],
  fetchCategories: async () => {
    const data = await categoryAPI.getAll();
    set({ categories: data });
  },
}));
