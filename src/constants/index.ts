export const APP_NAME = 'Inventory Management System';

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const CURRENCY_OPTIONS = [
  { value: 'Rs.', label: 'PKR (Rs.)' },
  { value: '$', label: 'USD ($)' },
  { value: '€', label: 'EUR (€)' },
  { value: '£', label: 'GBP (£)' },
];

export const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
export const MOBILE_REGEX = /^03\d{9}$/;

export const LOW_STOCK_THRESHOLD = 20;
export const EXPIRY_ALERT_DAYS = 90;

export const MESSAGES = {
  COMPANY_ADDED: 'Company added successfully',
  COMPANY_UPDATED: 'Company updated successfully',
  COMPANY_DELETED: 'Company deleted successfully',
  CATEGORY_ADDED: 'Category added successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  PRODUCT_ADDED: 'Product added successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  SALESMAN_ADDED: 'Salesman added successfully',
  SALESMAN_UPDATED: 'Salesman updated successfully',
  SALESMAN_DELETED: 'Salesman deleted successfully',
  INVOICE_SAVED: 'Invoice saved successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  DELETE_CONFIRM: 'Are you sure you want to delete this item?',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
};
