import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addCompany,
  updateCompany,
  deleteCompany,
  toggleCompanyStatus,
} from '@/features/companies/companiesSlice';
import { Company } from '@/types';

export function useCompanies() {
  const dispatch = useAppDispatch();
  const { companies } = useAppSelector(state => state.companies);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    companies,
    filteredCompanies,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    addCompany: (data: Omit<Company, 'id' | 'createdAt'>) => dispatch(addCompany(data)),
    updateCompany: (data: Company) => dispatch(updateCompany(data)),
    deleteCompany: (id: string) => dispatch(deleteCompany(id)),
    toggleStatus: (id: string) => dispatch(toggleCompanyStatus(id)),
  };
}
