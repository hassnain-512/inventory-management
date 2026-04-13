import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoriesState, Category } from '@/types';
import { dummyCategories } from '@/data/dummyData';
import { generateId } from '@/utils/helpers';

const initialState: CategoriesState = {
  categories: dummyCategories,
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<Omit<Category, 'id' | 'createdAt'>>) => {
      const newCategory: Category = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      state.categories.push(newCategory);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    toggleCategoryStatus: (state, action: PayloadAction<string>) => {
      const category = state.categories.find(c => c.id === action.payload);
      if (category) {
        category.status = category.status === 'active' ? 'inactive' : 'active';
      }
    },
  },
});

export const { addCategory, updateCategory, deleteCategory, toggleCategoryStatus } = categoriesSlice.actions;
export default categoriesSlice.reducer;
