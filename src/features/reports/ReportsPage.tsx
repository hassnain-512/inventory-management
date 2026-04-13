import { useRef, useState } from 'react';
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/common/Table';
import { useAppSelector } from '@/store/hooks';
import { formatDate, formatCurrency } from '@/utils/helpers';

const today = new Date().toISOString().split('T')[0];
const thisMonth = today.slice(0, 7); // 'YYYY-MM'

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function addMonths(monthStr: string, months: number): string {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function ReportsPage() {
  const { invoices } = useAppSelector(state => state.invoices);
  const { products } = useAppSelector(state => state.products);
  const { companies } = useAppSelector(state => state.companies);
  const { categories } = useAppSelector(state => state.categories);
  const settings = useAppSelector(state => state.settings);

  const [dailyDate, setDailyDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(thisMonth);

  const dailyPrintRef = useRef<HTMLDivElement>(null);
  const monthlyPrintRef = useRef<HTMLDivElement>(null);
  const stockPrintRef = useRef<HTMLDivElement>(null);

  const handleDailyPrint = useReactToPrint({ content: () => dailyPrintRef.current });
  const handleMonthlyPrint = useReactToPrint({ content: () => monthlyPrintRef.current });
  const handleStockPrint = useReactToPrint({ content: () => stockPrintRef.current });

  // Daily: confirmed invoices for selected date
  const dailyOrders = invoices.filter(
    inv => inv.status === 'confirmed' && inv.billingDate === dailyDate
  );
  const dailyRevenue = dailyOrders.reduce((s, i) => s + i.grandTotal, 0);
  const dailyItemsSold = dailyOrders.reduce((s, i) => s + i.items.reduce((is, it) => is + it.quantity, 0), 0);

  // Monthly: confirmed invoices for selected month
  const monthlyOrders = invoices.filter(
    inv => inv.status === 'confirmed' && inv.billingDate.startsWith(selectedMonth)
  );
  const monthlyRevenue = monthlyOrders.reduce((s, i) => s + i.grandTotal, 0);
  const monthlyItemsSold = monthlyOrders.reduce((s, i) => s + i.items.reduce((is, it) => is + it.quantity, 0), 0);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || '-';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '-';

  return (
    <div className="space-y-4">
      <Tabs defaultValue="daily">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="daily">Daily Sales</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Sales</TabsTrigger>
          <TabsTrigger value="stock">Stock Status</TabsTrigger>
        </TabsList>

        {/* ===== Daily Sales ===== */}
        <TabsContent value="daily" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDailyDate(d => addDays(d, -1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <input
                type="date"
                value={dailyDate}
                onChange={e => setDailyDate(e.target.value)}
                className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDailyDate(d => addDays(d, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setDailyDate(today)}
              >
                Today
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleDailyPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Confirmed Orders</p>
                <p className="text-2xl font-bold">{dailyOrders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(dailyRevenue, settings.currencySymbol)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold">{dailyItemsSold}</p>
              </CardContent>
            </Card>
          </div>

          {/* Printable Content */}
          <div ref={dailyPrintRef}>
            <div className="hidden print:block mb-4 text-center">
              <h1 className="text-xl font-bold">{settings.businessName}</h1>
              <p className="text-sm text-gray-600">Daily Sales Report — {formatDate(dailyDate)}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Sales Report — {formatDate(dailyDate)}</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyOrders.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No confirmed orders for {formatDate(dailyDate)}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Salesman</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Grand Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyOrders.map(inv => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell>{inv.customerName}</TableCell>
                          <TableCell>{inv.salesmanName}</TableCell>
                          <TableCell>{inv.items.reduce((s, i) => s + i.quantity, 0)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(inv.grandTotal, settings.currencySymbol)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/30">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell>{dailyItemsSold}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dailyRevenue, settings.currencySymbol)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== Monthly Sales ===== */}
        <TabsContent value="monthly" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedMonth(m => addMonths(m, -1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedMonth(m => addMonths(m, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleMonthlyPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Confirmed Orders</p>
                <p className="text-2xl font-bold">{monthlyOrders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue, settings.currencySymbol)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold">{monthlyItemsSold}</p>
              </CardContent>
            </Card>
          </div>

          {/* Printable Content */}
          <div ref={monthlyPrintRef}>
            <div className="hidden print:block mb-4 text-center">
              <h1 className="text-xl font-bold">{settings.businessName}</h1>
              <p className="text-sm text-gray-600">Monthly Sales Report — {monthLabel(selectedMonth)}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Sales Report — {monthLabel(selectedMonth)}</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyOrders.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No confirmed orders for {monthLabel(selectedMonth)}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Salesman</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Grand Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyOrders.map(inv => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell>{formatDate(inv.billingDate)}</TableCell>
                          <TableCell>{inv.customerName}</TableCell>
                          <TableCell>{inv.salesmanName}</TableCell>
                          <TableCell>{inv.items.reduce((s, i) => s + i.quantity, 0)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(inv.grandTotal, settings.currencySymbol)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/30">
                        <TableCell colSpan={4}>Total</TableCell>
                        <TableCell>{monthlyItemsSold}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(monthlyRevenue, settings.currencySymbol)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== Stock Status ===== */}
        <TabsContent value="stock" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleStockPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Out of Stock / Negative</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock <= 0).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Stock Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    products.reduce((s, p) => s + Math.max(0, p.stock) * p.retailerPrice, 0),
                    settings.currencySymbol
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Printable Content */}
          <div ref={stockPrintRef}>
            <div className="hidden print:block mb-4 text-center">
              <h1 className="text-xl font-bold">{settings.businessName}</h1>
              <p className="text-sm text-gray-600">Stock Status Report</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Stock Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">{product.code}</TableCell>
                        <TableCell>{getCompanyName(product.companyId)}</TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell className={`text-right font-semibold ${product.stock < 0 ? 'text-red-600' : product.stock === 0 ? 'text-orange-500' : ''}`}>
                          {product.stock}
                        </TableCell>
                        <TableCell>
                          {product.stock < 0 ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200">Negative</Badge>
                          ) : product.stock === 0 ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Out of Stock</Badge>
                          ) : product.stock <= 10 ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
