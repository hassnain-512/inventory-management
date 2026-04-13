import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductsState, Product } from '@/types';
import { dummyProducts } from '@/data/dummyData';
import { generateId } from '@/utils/helpers';

const initialState: ProductsState = {
  products: dummyProducts,
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<Product, 'id' | 'createdAt'>>) => {
      const newProduct: Product = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      state.products.push(newProduct);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    toggleProductStatus: (state, action: PayloadAction<string>) => {
      const product = state.products.find(p => p.id === action.payload);
      if (product) {
        product.status = product.status === 'active' ? 'inactive' : 'active';
      }
    },
    updateStock: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const product = state.products.find(p => p.id === action.payload.productId);
      if (product) {
        product.stock = product.stock - action.payload.quantity;
      }
    },
  },
});

export const { addProduct, updateProduct, deleteProduct, toggleProductStatus, updateStock } = productsSlice.actions;
export default productsSlice.reducer;
