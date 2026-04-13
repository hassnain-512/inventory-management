import { configureStore } from '@reduxjs/toolkit';
import companiesReducer from '@/features/companies/companiesSlice';
import categoriesReducer from '@/features/categories/categoriesSlice';
import productsReducer from '@/features/products/productsSlice';
import salesmenReducer from '@/features/salesmen/salesmenSlice';
import invoicesReducer from '@/features/billing/invoicesSlice';
import settingsReducer from '@/features/settings/settingsSlice';

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    categories: categoriesReducer,
    products: productsReducer,
    salesmen: salesmenReducer,
    invoices: invoicesReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
