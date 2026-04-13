import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState } from '@/types';

const savedSettings = localStorage.getItem('appSettings');
const defaultSettings: SettingsState = {
  businessName: 'My Pharmacy',
  businessAddress: '123 Business Street, Karachi',
  contactEmail: 'info@mypharmacy.com',
  contactPhone: '021-12345678',
  currencySymbol: 'Rs.',
  taxPercentage: 0,
  invoicePrefix: 'INV',
  theme: 'light',
};

const initialState: SettingsState = savedSettings
  ? JSON.parse(savedSettings)
  : defaultSettings;

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
      localStorage.setItem('appSettings', JSON.stringify({ ...state, ...action.payload }));
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('appSettings', JSON.stringify(state));
    },
  },
});

export const { updateSettings, toggleTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
