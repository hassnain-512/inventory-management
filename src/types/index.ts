// Company
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  companyId: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  code: string;
  companyId: string;
  categoryId: string;
  basePrice: number;
  retailerPrice: number;
  stock: number;
  batchCode: string;
  expiryDate: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Salesman
export interface Salesman {
  id: string;
  name: string;
  cnic: string;
  mobile: string;
  email: string;
  address: string;
  dateOfBirth: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Invoice Item
export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  companyId: string;
  categoryId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  unitPrice: number;
  discount: number;
  total: number;
}

// Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  salesmanId: string;
  salesmanName: string;
  customerName: string;
  billingDate: string;
  notes: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  createdAt: string;
}

// Settings
export interface AppSettings {
  businessName: string;
  businessAddress: string;
  contactEmail: string;
  contactPhone: string;
  currencySymbol: string;
  taxPercentage: number;
  invoicePrefix: string;
  theme: 'light' | 'dark';
}

// Redux State Types
export interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
}

export interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export interface SalesmenState {
  salesmen: Salesman[];
  loading: boolean;
  error: string | null;
}

export interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

export interface SettingsState extends AppSettings {}
