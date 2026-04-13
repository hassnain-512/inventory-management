import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SalesmenState, Salesman } from '@/types';
import { dummySalesmen } from '@/data/dummyData';
import { generateId } from '@/utils/helpers';

const initialState: SalesmenState = {
  salesmen: dummySalesmen,
  loading: false,
  error: null,
};

const salesmenSlice = createSlice({
  name: 'salesmen',
  initialState,
  reducers: {
    addSalesman: (state, action: PayloadAction<Omit<Salesman, 'id' | 'createdAt'>>) => {
      const newSalesman: Salesman = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      state.salesmen.push(newSalesman);
    },
    updateSalesman: (state, action: PayloadAction<Salesman>) => {
      const index = state.salesmen.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.salesmen[index] = action.payload;
      }
    },
    deleteSalesman: (state, action: PayloadAction<string>) => {
      state.salesmen = state.salesmen.filter(s => s.id !== action.payload);
    },
    toggleSalesmanStatus: (state, action: PayloadAction<string>) => {
      const salesman = state.salesmen.find(s => s.id === action.payload);
      if (salesman) {
        salesman.status = salesman.status === 'active' ? 'inactive' : 'active';
      }
    },
  },
});

export const { addSalesman, updateSalesman, deleteSalesman, toggleSalesmanStatus } = salesmenSlice.actions;
export default salesmenSlice.reducer;
