import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { EXPIRY_ALERT_DAYS, LOW_STOCK_THRESHOLD } from '@/constants';
import { Product } from '@/types';

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const formatCurrency = (amount: number, symbol = 'Rs.'): string => {
  return `${symbol} ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateInvoiceNumber = (prefix: string, count: number): string => {
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(3, '0');
  return `${prefix}-${year}-${num}`;
};

export const isExpiringSoon = (expiryDateStr: string): boolean => {
  if (!expiryDateStr) return false;
  try {
    const expiryDate = parseISO(expiryDateStr);
    const alertDate = addDays(new Date(), EXPIRY_ALERT_DAYS);
    return isBefore(expiryDate, alertDate) && isAfter(expiryDate, new Date());
  } catch {
    return false;
  }
};

export const isExpired = (expiryDateStr: string): boolean => {
  if (!expiryDateStr) return false;
  try {
    return isBefore(parseISO(expiryDateStr), new Date());
  } catch {
    return false;
  }
};

export const isLowStock = (product: Product): boolean => {
  return product.stock <= LOW_STOCK_THRESHOLD;
};

export const validateCNIC = (cnic: string): boolean => {
  return /^\d{5}-\d{7}-\d{1}$/.test(cnic);
};

export const validateMobile = (mobile: string): boolean => {
  return /^03\d{9}$/.test(mobile);
};

export const getExpiryStatus = (expiryDateStr: string): 'expired' | 'expiring' | 'valid' => {
  if (isExpired(expiryDateStr)) return 'expired';
  if (isExpiringSoon(expiryDateStr)) return 'expiring';
  return 'valid';
};
