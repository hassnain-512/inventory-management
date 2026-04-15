import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Tag,
  Package,
  Users,
  Receipt,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency, formatDate, isExpiringSoon, isLowStock } from '@/utils/helpers';
import { LOW_STOCK_THRESHOLD } from '@/constants';

export function DashboardPage() {
  const navigate = useNavigate();
  const { companies } = useAppSelector(state => state.companies);
  const { categories } = useAppSelector(state => state.categories);
  const { products } = useAppSelector(state => state.products);
  const { salesmen } = useAppSelector(state => state.salesmen);
  const { invoices } = useAppSelector(state => state.invoices);
  const settings = useAppSelector(state => state.settings);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const lowStockProducts = products.filter(isLowStock);
  const expiringProducts = products.filter(p => isExpiringSoon(p.expiryDate));
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const metricCards = [
    {
      title: 'Total Companies',
      value: companies.length,
      active: companies.filter(c => c.status === 'active').length,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
      path: '/companies',
    },
    {
      title: 'Total Categories',
      value: categories.length,
      active: categories.filter(c => c.status === 'active').length,
      icon: Tag,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
      path: '/categories',
    },
    {
      title: 'Total Products',
      value: products.length,
      active: products.filter(p => p.status === 'active').length,
      icon: Package,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
      path: '/products',
    },
    {
      title: 'Total Salesmen',
      value: salesmen.length,
      active: salesmen.filter(s => s.status === 'active').length,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950',
      path: '/salesmen',
    },
    {
      title: 'Total Orders',
      value: invoices.length,
      active: null,
      icon: Receipt,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950',
      path: '/orders',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue, settings.currencySymbol),
      active: null,
      icon: TrendingUp,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-950',
      path: '/orders',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(card.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                    {card.active !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {card.active} active
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${card.bg}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Sales</CardTitle>
              <CardDescription>Last 5 invoices</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.salesmanName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(invoice.grandTotal, settings.currencySymbol)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.billingDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <div className="space-y-4">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                Products with stock ≤ {LOW_STOCK_THRESHOLD}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No low stock items</p>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.code}</p>
                      </div>
                      <Badge variant="warning">{product.stock} left</Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 4 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate('/products')}
                    >
                      +{lowStockProducts.length - 4} more
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiry Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Expiry Alerts
              </CardTitle>
              <CardDescription>Products expiring within 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No expiry alerts</p>
              ) : (
                <div className="space-y-2">
                  {expiringProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.code}</p>
                      </div>
                      <Badge variant="destructive">{formatDate(product.expiryDate)}</Badge>
                    </div>
                  ))}
                  {expiringProducts.length > 4 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate('/products')}
                    >
                      +{expiringProducts.length - 4} more
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
