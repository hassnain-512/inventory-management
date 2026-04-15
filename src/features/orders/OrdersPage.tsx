import { useState, useRef } from 'react';
import {
  ChevronDown, ChevronRight, Printer, Trash2,
  CheckCircle, XCircle, ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/common/AlertDialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/common/Table';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { confirmOrder, discardOrder, deleteInvoice } from '@/features/billing/invoicesSlice';
import { deductStockBatch } from '@/features/products/productsSlice';
import { Invoice } from '@/types';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { InvoicePrint } from '@/features/billing/InvoicePrint';

const today = new Date().toISOString().split('T')[0];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function OrdersPage() {
  const dispatch = useAppDispatch();
  const { invoices } = useAppSelector(state => state.invoices);
  const settings = useAppSelector(state => state.settings);

  const [selectedDate, setSelectedDate] = useState(today);
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

  const filteredInvoices = invoices.filter(inv => inv.billingDate === selectedDate);

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

  const handleConfirm = (invoice: Invoice) => {
    dispatch(confirmOrder(invoice.id));
    dispatch(deductStockBatch(invoice.items.map(item => ({ productId: item.productId, quantity: item.quantity }))));
    toast.success(`Order ${invoice.invoiceNumber} confirmed`);
  };

  const handleDiscard = (invoice: Invoice) => {
    dispatch(discardOrder(invoice.id));
    toast.info(`Order ${invoice.invoiceNumber} discarded`);
  };

  const pendingCount = filteredInvoices.filter(i => i.status === 'pending').length;
  const confirmedCount = filteredInvoices.filter(i => i.status === 'confirmed').length;
  const totalRevenue = filteredInvoices
    .filter(i => i.status === 'confirmed')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const statusBadge = (status: Invoice['status']) => {
    if (status === 'confirmed') return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
    if (status === 'discarded') return <Badge className="bg-red-100 text-red-800 border-red-200">Discarded</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(d => addDays(d, -1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(d => addDays(d, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(today)}
              className="text-xs"
            >
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <p className="text-sm text-muted-foreground">Pending / Confirmed</p>
            <p className="text-2xl font-bold">
              <span className="text-yellow-600">{pendingCount}</span>
              {' / '}
              <span className="text-green-600">{confirmedCount}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Confirmed Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue, settings.currencySymbol)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Invoices */}
      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No orders found for {formatDate(selectedDate)}
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([salesmanId, group]) => {
          const isExpanded = expandedSalesmen.has(salesmanId);
          const groupTotal = group.invoices
            .filter(i => i.status === 'confirmed')
            .reduce((sum, inv) => sum + inv.grandTotal, 0);

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
                        <TableHead>Items</TableHead>
                        <TableHead>Grand Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.invoices.map(invoice => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.items.length} items</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(invoice.grandTotal, settings.currencySymbol)}
                          </TableCell>
                          <TableCell>{statusBadge(invoice.status)}</TableCell>
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
                              {invoice.status === 'pending' && (
                                <>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Confirm order"
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Order</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Confirm order "{invoice.invoiceNumber}"? This will deduct stock and add it to the sales reports.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-green-600 text-white hover:bg-green-700"
                                          onClick={() => handleConfirm(invoice)}
                                        >
                                          Confirm
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Discard order"
                                      >
                                        <XCircle className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Discard Order</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Discard order "{invoice.invoiceNumber}"? The order will be marked as discarded.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          onClick={() => handleDiscard(invoice)}
                                        >
                                          Discard
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
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

