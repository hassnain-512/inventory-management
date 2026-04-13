import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from '@/features/products/productsSlice';
import { Product } from '@/types';

export function useProducts() {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector(state => state.products);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCompany = companyFilter === 'all' || product.companyId === companyFilter;
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
    return matchesSearch && matchesStatus && matchesCompany && matchesCategory;
  });

  return {
    products,
    filteredProducts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    categoryFilter,
    setCategoryFilter,
    addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => dispatch(addProduct(data)),
    updateProduct: (data: Product) => dispatch(updateProduct(data)),
    deleteProduct: (id: string) => dispatch(deleteProduct(id)),
    toggleStatus: (id: string) => dispatch(toggleProductStatus(id)),
  };
}
