import React from 'react';
import { Invoice } from '@/types';
import { SettingsState } from '@/types';
import { formatDate, formatCurrency } from '@/utils/helpers';

interface InvoicePrintProps {
  invoice: Invoice;
  settings: SettingsState;
}

export const InvoicePrint = React.forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice, settings }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{settings.businessName}</h1>
            <p className="text-gray-600">{settings.businessAddress}</p>
            <p className="text-gray-600">{settings.contactPhone}</p>
            <p className="text-gray-600">{settings.contactEmail}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-gray-600">#{invoice.invoiceNumber}</p>
            <p className="text-gray-600">Date: {formatDate(invoice.billingDate)}</p>
          </div>
        </div>

        <hr className="border-gray-300 mb-6" />

        {/* Bill To */}
        <div className="mb-6">
          <p className="text-gray-600">Salesman: {invoice.salesmanName}</p>
          {invoice.notes && <p className="text-gray-600 mt-1">Note: {invoice.notes}</p>}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left text-sm">#</th>
              <th className="border border-gray-300 p-2 text-left text-sm">Product</th>
              <th className="border border-gray-300 p-2 text-left text-sm">Code</th>
              <th className="border border-gray-300 p-2 text-left text-sm">Batch</th>
              <th className="border border-gray-300 p-2 text-left text-sm">Expiry</th>
              <th className="border border-gray-300 p-2 text-right text-sm">Qty</th>
              <th className="border border-gray-300 p-2 text-right text-sm">Unit Price</th>
              <th className="border border-gray-300 p-2 text-right text-sm">Disc (Rs.)</th>
              <th className="border border-gray-300 p-2 text-right text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={item.id}>
                <td className="border border-gray-300 p-2 text-sm">{i + 1}</td>
                <td className="border border-gray-300 p-2 text-sm">{item.productName}</td>
                <td className="border border-gray-300 p-2 text-sm">{item.productCode}</td>
                <td className="border border-gray-300 p-2 text-sm">{item.batchNumber}</td>
                <td className="border border-gray-300 p-2 text-sm">{formatDate(item.expiryDate)}</td>
                <td className="border border-gray-300 p-2 text-sm text-right">{item.quantity}</td>
                <td className="border border-gray-300 p-2 text-sm text-right">
                  {formatCurrency(item.unitPrice, settings.currencySymbol)}
                </td>
                <td className="border border-gray-300 p-2 text-sm text-right">{formatCurrency(item.discount, settings.currencySymbol)}</td>
                <td className="border border-gray-300 p-2 text-sm text-right font-medium">
                  {formatCurrency(item.total, settings.currencySymbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal, settings.currencySymbol)}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between font-bold">
              <span>Grand Total:</span>
              <span>{formatCurrency(invoice.grandTotal, settings.currencySymbol)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <hr className="border-gray-300 mb-4" />
        <p className="text-center text-gray-500 text-sm">
          Thank you for your business! — {settings.businessName}
        </p>
      </div>
    );
  }
);

InvoicePrint.displayName = 'InvoicePrint';
