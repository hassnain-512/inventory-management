import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Printer, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/Select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/common/AlertDialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/common/Table';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { deleteInvoice } from '@/features/billing/invoicesSlice';
import { Invoice } from '@/types';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { InvoicePrint } from '@/features/billing/InvoicePrint';

export function OrdersPage() {
  const dispatch = useAppDispatch();
  const { invoices } = useAppSelector(state => state.invoices);
  const { salesmen } = useAppSelector(state => state.salesmen);
  const settings = useAppSelector(state => state.settings);

  const [search, setSearch] = useState('');
  const [salesmanFilter, setSalesmanFilter] = useState('all');
  const [expandedSalesmen, setExpandedSalesmen] = useState<Set<string>>(new Set());
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const triggerPrint = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    setTimeout(() => handlePrint(), 100);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.salesmanName.toLowerCase().includes(search.toLowerCase());
    const matchesSalesman = salesmanFilter === 'all' || inv.salesmanId === salesmanFilter;
    return matchesSearch && matchesSalesman;
  });

  // Group by salesman
  const grouped = filteredInvoices.reduce<Record<string, { salesmanName: string; invoices: Invoice[] }>>(
    (acc, inv) => {
      if (!acc[inv.salesmanId]) {
        acc[inv.salesmanId] = { salesmanName: inv.salesmanName, invoices: [] };
      }
      acc[inv.salesmanId].invoices.push(inv);
      return acc;
    },
    {}
  );

  const toggleSalesman = (id: string) => {
    setExpandedSalesmen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{filteredInvoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue, settings.currencySymbol)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Salesmen</p>
            <p className="text-2xl font-bold">{Object.keys(grouped).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Salesmen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Salesmen</SelectItem>
            {salesmen.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grouped Invoices */}
      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No orders found
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([salesmanId, group]) => {
          const isExpanded = expandedSalesmen.has(salesmanId);
          const groupTotal = group.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

          return (
            <Card key={salesmanId}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors py-4"
                onClick={() => toggleSalesman(salesmanId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <CardTitle className="text-base">{group.salesmanName}</CardTitle>
                    <Badge variant="secondary">{group.invoices.length} orders</Badge>
                  </div>
                  <span className="font-semibold text-sm">
                    {formatCurrency(groupTotal, settings.currencySymbol)}
                  </span>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Grand Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.invoices.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.customerName}</TableCell>
                          <TableCell>{formatDate(invoice.billingDate)}</TableCell>
                          <TableCell>{invoice.items.length} items</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(invoice.grandTotal, settings.currencySymbol)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => triggerPrint(invoice)}
                                title="Print invoice"
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" title="Delete invoice">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Delete invoice "{invoice.invoiceNumber}"? This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => {
                                        dispatch(deleteInvoice(invoice.id));
                                        toast.success('Invoice deleted');
                                      }}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
            </Card>
          );
        })
      )}

      {/* Print Component */}
      {printInvoice && (
        <div className="hidden">
          <InvoicePrint ref={printRef} invoice={printInvoice} settings={settings} />
        </div>
      )}
    </div>
  );
}
