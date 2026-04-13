import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvoicesState, Invoice } from '@/types';
import { dummyInvoices } from '@/data/dummyData';
import { generateId } from '@/utils/helpers';

const initialState: InvoicesState = {
  invoices: dummyInvoices,
  loading: false,
  error: null,
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Omit<Invoice, 'id' | 'createdAt' | 'status'>>) => {
      const newInvoice: Invoice = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      state.invoices.push(newInvoice);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter(i => i.id !== action.payload);
    },
    confirmOrder: (state, action: PayloadAction<string>) => {
      const invoice = state.invoices.find(i => i.id === action.payload);
      if (invoice) {
        invoice.status = 'confirmed';
      }
    },
    discardOrder: (state, action: PayloadAction<string>) => {
      const invoice = state.invoices.find(i => i.id === action.payload);
      if (invoice) {
        invoice.status = 'discarded';
      }
    },
  },
});

export const { addInvoice, updateInvoice, deleteInvoice, confirmOrder, discardOrder } = invoicesSlice.actions;
export default invoicesSlice.reducer;
