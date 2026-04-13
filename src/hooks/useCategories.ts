import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from '@/features/categories/categoriesSlice';
import { Category } from '@/types';

export function useCategories() {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector(state => state.categories);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
    const matchesCompany = companyFilter === 'all' || category.companyId === companyFilter;
    return matchesSearch && matchesStatus && matchesCompany;
  });

  return {
    categories,
    filteredCategories,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    addCategory: (data: Omit<Category, 'id' | 'createdAt'>) => dispatch(addCategory(data)),
    updateCategory: (data: Category) => dispatch(updateCategory(data)),
    deleteCategory: (id: string) => dispatch(deleteCategory(id)),
    toggleStatus: (id: string) => dispatch(toggleCategoryStatus(id)),
  };
}
