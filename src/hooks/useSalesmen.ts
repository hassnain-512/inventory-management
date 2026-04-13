import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addSalesman,
  updateSalesman,
  deleteSalesman,
  toggleSalesmanStatus,
} from '@/features/salesmen/salesmenSlice';
import { Salesman } from '@/types';

export function useSalesmen() {
  const dispatch = useAppDispatch();
  const { salesmen } = useAppSelector(state => state.salesmen);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSalesmen = salesmen.filter(salesman => {
    const matchesSearch =
      salesman.name.toLowerCase().includes(search.toLowerCase()) ||
      salesman.cnic.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || salesman.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    salesmen,
    filteredSalesmen,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    addSalesman: (data: Omit<Salesman, 'id' | 'createdAt'>) => dispatch(addSalesman(data)),
    updateSalesman: (data: Salesman) => dispatch(updateSalesman(data)),
    deleteSalesman: (id: string) => dispatch(deleteSalesman(id)),
    toggleStatus: (id: string) => dispatch(toggleSalesmanStatus(id)),
  };
}
