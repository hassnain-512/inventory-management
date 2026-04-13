import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CompaniesState, Company } from '@/types';
import { dummyCompanies } from '@/data/dummyData';
import { generateId } from '@/utils/helpers';

const initialState: CompaniesState = {
  companies: dummyCompanies,
  loading: false,
  error: null,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    addCompany: (state, action: PayloadAction<Omit<Company, 'id' | 'createdAt'>>) => {
      const newCompany: Company = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      state.companies.push(newCompany);
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.companies.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
    },
    deleteCompany: (state, action: PayloadAction<string>) => {
      state.companies = state.companies.filter(c => c.id !== action.payload);
    },
    toggleCompanyStatus: (state, action: PayloadAction<string>) => {
      const company = state.companies.find(c => c.id === action.payload);
      if (company) {
        company.status = company.status === 'active' ? 'inactive' : 'active';
      }
    },
  },
});

export const { addCompany, updateCompany, deleteCompany, toggleCompanyStatus } = companiesSlice.actions;
export default companiesSlice.reducer;
