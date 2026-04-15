import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/companies': 'Companies Management',
  '/categories': 'Categories Management',
  '/products': 'Products Management',
  '/salesmen': 'Salesmen Management',
  '/attendance': 'Attendance',
  '/attendance/history': 'Attendance History',
  '/billing': 'Sales & Billing',
  '/orders': 'Orders',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Inventory Management';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
