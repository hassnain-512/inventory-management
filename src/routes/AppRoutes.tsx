import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CompaniesPage } from '@/features/companies/CompaniesPage';
import { CategoriesPage } from '@/features/categories/CategoriesPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { SalesmenPage } from '@/features/salesmen/SalesmenPage';
import { BillingPage } from '@/features/billing/BillingPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { AttendanceHistoryPage } from '@/features/attendance/AttendanceHistoryPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="salesmen" element={<SalesmenPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/history" element={<AttendanceHistoryPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
