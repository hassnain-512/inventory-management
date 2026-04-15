import { useState, useRef } from 'react';
import { Plus, Trash2, Printer, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Label } from '@/components/common/Label';
import { Textarea } from '@/components/common/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Separator } from '@/components/common/Separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/Select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/common/Table';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addInvoice } from '@/features/billing/invoicesSlice';
import { Invoice, InvoiceItem } from '@/types';
import { generateId, generateInvoiceNumber, formatCurrency } from '@/utils/helpers';
import { MESSAGES } from '@/constants';
import { InvoicePrint } from './InvoicePrint';

interface LineItem {
  id: string;
  companyId: string;
  categoryId: string;
  productId: string;
  productName: string;
  productCode: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  unitPrice: number;
  discount: number;
}

const emptyLine = (): LineItem => ({
  id: generateId(),
  companyId: '',
  categoryId: '',
  productId: '',
  productName: '',
  productCode: '',
  batchNumber: '',
  quantity: 1,
  expiryDate: '',
  unitPrice: 0,
  discount: 0,
});

export function BillingPage() {
  const dispatch = useAppDispatch();
  const { companies } = useAppSelector(state => state.companies);
  const { categories } = useAppSelector(state => state.categories);
  const { products } = useAppSelector(state => state.products);
  const { salesmen } = useAppSelector(state => state.salesmen);
  const { invoices } = useAppSelector(state => state.invoices);
  const settings = useAppSelector(state => state.settings);

  const [salesmanId, setSalesmanId] = useState('');
  const [billingDate, setBillingDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const updateLine = (id: string, field: keyof LineItem, value: string | number) => {
    setLines(prev =>
      prev.map(line => {
        if (line.id !== id) return line;
        const updated = { ...line, [field]: value };

        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.productCode = product.code;
            updated.expiryDate = product.expiryDate;
            updated.unitPrice = product.retailerPrice;
            updated.batchNumber = product.batchCode;
          }
        }

        if (field === 'companyId') {
          updated.categoryId = '';
          updated.productId = '';
          updated.productName = '';
          updated.productCode = '';
        }

        if (field === 'categoryId') {
          updated.productId = '';
          updated.productName = '';
          updated.productCode = '';
        }

        return updated;
      })
    );
  };

  const lineTotal = (line: LineItem) => {
    const gross = line.quantity * line.unitPrice;
    return gross - line.discount;
  };

  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const grandTotal = subtotal;

  const handleSave = () => {
    if (!salesmanId) { toast.error('Please select a salesman'); return; }
    if (lines.some(l => !l.productId)) { toast.error('All product rows must have a product selected'); return; }

    const salesman = salesmen.find(s => s.id === salesmanId);
    const invoiceNumber = generateInvoiceNumber(settings.invoicePrefix, invoices.length);

    const items: InvoiceItem[] = lines.map(l => ({
      id: l.id,
      productId: l.productId,
      productName: l.productName,
      productCode: l.productCode,
      companyId: l.companyId,
      categoryId: l.categoryId,
      batchNumber: l.batchNumber,
      quantity: l.quantity,
      expiryDate: l.expiryDate,
      unitPrice: l.unitPrice,
      discount: l.discount,
      total: lineTotal(l),
    }));

    const invoice: Omit<Invoice, 'id' | 'createdAt' | 'status'> = {
      invoiceNumber,
      salesmanId,
      salesmanName: salesman?.name || '',
      billingDate,
      notes,
      items,
      subtotal,
      grandTotal,
    };

    dispatch(addInvoice(invoice));
    const newInvoice: Invoice = { ...invoice, id: generateId(), createdAt: new Date().toISOString().split('T')[0], status: 'pending' };
    setSavedInvoice(newInvoice);
    toast.success(MESSAGES.INVOICE_SAVED);

    // Reset form
    setSalesmanId('');
    setNotes('');
    setLines([emptyLine()]);
    setBillingDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Salesman *</Label>
              <Select value={salesmanId} onValueChange={setSalesmanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select salesman" />
                </SelectTrigger>
                <SelectContent>
                  {salesmen.filter(s => s.status === 'active').map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Billing Date</Label>
              <Input
                type="date"
                value={billingDate}
                onChange={e => setBillingDate(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Lines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Products</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLines(prev => [...prev, emptyLine()])}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Disc (Rs.)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => {
                  const lineCategories = categories.filter(
                    c => c.companyId === line.companyId && c.status === 'active'
                  );
                  const lineProducts = products.filter(
                    p => p.categoryId === line.categoryId && p.status === 'active'
                  );

                  return (
                    <TableRow key={line.id}>
                      <TableCell className="min-w-[140px]">
                        <Select
                          value={line.companyId}
                          onValueChange={v => updateLine(line.id, 'companyId', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.filter(c => c.status === 'active').map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="min-w-[130px]">
                        <Select
                          value={line.categoryId}
                          onValueChange={v => updateLine(line.id, 'categoryId', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {lineCategories.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="min-w-[150px]">
                        <Select
                          value={line.productId}
                          onValueChange={v => updateLine(line.id, 'productId', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {lineProducts.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="min-w-[90px]">
                        <Input
                          className="h-8 text-xs"
                          value={line.productCode}
                          readOnly
                          placeholder="Auto"
                        />
                      </TableCell>

                      <TableCell className="min-w-[100px]">
                        <Input
                          className="h-8 text-xs"
                          value={line.batchNumber}
                          onChange={e => updateLine(line.id, 'batchNumber', e.target.value)}
                          placeholder="Batch"
                        />
                      </TableCell>

                      <TableCell className="min-w-[70px]">
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={e => updateLine(line.id, 'quantity', Number(e.target.value))}
                        />
                      </TableCell>

                      <TableCell className="min-w-[120px]">
                        <Input
                          className="h-8 text-xs"
                          type="date"
                          value={line.expiryDate}
                          onChange={e => updateLine(line.id, 'expiryDate', e.target.value)}
                        />
                      </TableCell>

                      <TableCell className="min-w-[100px]">
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={e => updateLine(line.id, 'unitPrice', Number(e.target.value))}
                        />
                      </TableCell>

                      <TableCell className="min-w-[90px]">
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.discount}
                          onChange={e => updateLine(line.id, 'discount', Number(e.target.value))}
                        />
                      </TableCell>

                      <TableCell className="min-w-[100px] font-medium text-sm">
                        {formatCurrency(lineTotal(line), settings.currencySymbol)}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLines(prev => prev.filter(l => l.id !== line.id))}
                          disabled={lines.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal, settings.currencySymbol)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {savedInvoice && (
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Last Invoice
          </Button>
        )}
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Invoice
        </Button>
      </div>

      {/* Print Component (hidden) */}
      {savedInvoice && (
        <div className="hidden">
          <InvoicePrint ref={printRef} invoice={savedInvoice} settings={settings} />
        </div>
      )}
    </div>
  );
}
