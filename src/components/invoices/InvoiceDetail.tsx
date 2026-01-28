import { Printer, ArrowLeft, Phone, Calendar, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge, formatDate } from "@/data/invoices";
import type { Invoice } from "@/lib/api";

interface InvoiceDetailProps {
  invoice: Invoice;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Actions - Hidden when printing */}
      <div className="print:hidden flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/invoices")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Invoices</span>
        </button>
        
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          <Printer className="h-5 w-5" />
          Print Invoice
        </button>
      </div>

      {/* Invoice Document */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-border print:border-gray-300">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            {/* Company Info - UPDATED SECTION */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                {/* LOGO ADDED HERE */}
                <img 
                  src="/src/assets/logo.ico" 
                  alt="Light Craft Logo" 
                  className="h-16 w-auto object-contain" 
                />
                
                <div>
                  <h1 className="text-2xl font-bold text-foreground print:text-black">Light Craft Lahore</h1>
                  <p className="text-sm text-muted-foreground print:text-gray-600">Business Manager</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground print:text-gray-600">
                <p>2 Beadon Rd, Garhi Shahu</p>
                <p>Lahore, Pakistan</p>
                <p>Phone: 0311-7722070</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="text-left md:text-right">
              <h2 className="text-3xl font-extrabold text-primary print:text-blue-600 mb-4">INVOICE</h2>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 md:justify-end">
                  <Hash className="h-4 w-4 text-muted-foreground print:text-gray-500" />
                  <span className="font-mono font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  <Calendar className="h-4 w-4 text-muted-foreground print:text-gray-500" />
                  <span>{formatDate(invoice.createdAt)}</span>
                </div>
                <div className="mt-2">
                  <StatusBadge status={invoice.paymentStatus} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 md:p-8 border-b border-border print:border-gray-300 bg-secondary/30 print:bg-gray-50">
          <h3 className="text-sm font-bold text-muted-foreground print:text-gray-600 uppercase tracking-wider mb-3">Bill To</h3>
          <div>
            <p className="text-lg font-bold text-foreground print:text-black">{invoice.customerName}</p>
            {invoice.customerPhone && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground print:text-gray-600 mt-1">
                <Phone className="h-4 w-4" />
                {invoice.customerPhone}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 md:p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border print:border-gray-300">
                <th className="text-left py-3 text-sm font-bold text-muted-foreground print:text-gray-600 uppercase tracking-wider">Item</th>
                <th className="text-center py-3 text-sm font-bold text-muted-foreground print:text-gray-600 uppercase tracking-wider">Qty</th>
                <th className="text-right py-3 text-sm font-bold text-muted-foreground print:text-gray-600 uppercase tracking-wider">Price</th>
                <th className="text-right py-3 text-sm font-bold text-muted-foreground print:text-gray-600 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-4">
                    <p className="font-bold text-foreground print:text-black">{item.name}</p>
                    {item.sku && (
                      <p className="text-xs text-muted-foreground print:text-gray-500 font-mono">{item.sku}</p>
                    )}
                  </td>
                  <td className="py-4 text-center font-medium">{item.quantity}</td>
                  <td className="py-4 text-right">Rs. {item.price.toLocaleString()}</td>
                  <td className="py-4 text-right font-bold text-primary print:text-blue-600">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t-2 border-border print:border-gray-300">
            <div className="flex flex-col items-end space-y-2">
              <div className="flex justify-between w-full max-w-xs text-sm">
                <span className="text-muted-foreground print:text-gray-600">Subtotal</span>
                <span className="font-medium">Rs. {invoice.subTotal.toLocaleString()}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between w-full max-w-xs text-sm">
                  <span className="text-muted-foreground print:text-gray-600">Tax ({invoice.taxRate}%)</span>
                  <span className="font-medium">Rs. {invoice.taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-xs pt-2 border-t border-border print:border-gray-300">
                <span className="text-lg font-bold text-foreground print:text-black">Grand Total</span>
                <span className="text-2xl font-extrabold text-primary print:text-blue-600">
                  Rs. {invoice.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-secondary/30 print:bg-gray-50 text-center">
          <p className="text-sm text-muted-foreground print:text-gray-600">Thank you for your Shopping!</p>
          <p className="text-xs text-muted-foreground print:text-gray-500 mt-1">
            Light Craft • Your trusted LED supplier
          </p>
        </div>
      </div>
    </div>
  );
}
