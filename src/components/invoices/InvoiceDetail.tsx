
import { Printer, ArrowLeft, Phone, Calendar, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge, formatDate } from "@/data/invoices";
import type { Invoice } from "@/lib/api";
// Import logos
import logo from "@/assets/logo.ico";
import oxfordLogo from "@/assets/oxford-logo.jpeg"; // Ensure this exists in your assets

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
      <div className="bg-white p-8 rounded-2xl border border-border shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none text-black">
        
        {/* Top Branding Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-4">
             <img src={lightCraftLogo} alt="Light Craft" className="h-20 w-20 object-contain" />
             <img src={oxfordLogo} alt="Oxford Next-Gen" className="h-20 w-20 object-contain" />
          </div>
          
          <div className="text-right">
            <h3 className="font-bold text-lg bg-gray-200 px-4 py-1 rounded">Outlet Details:</h3>
            <p className="mt-2 text-sm">2 Beadon Road, Lahore</p>
            <div className="text-sm">
              <p>Hamza Butt: 0320-9497474</p>
              <p>Haider Butt: 0311-7722070</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter">LIGHT CRAFT</h1>
        </div>

        {/* Client and Invoice Info */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2">
            <h3 className="bg-gray-200 px-3 py-1 font-bold inline-block mb-2">Sold to:</h3>
            <p className="font-bold text-lg">{invoice.customerName}</p>
            <p className="text-sm">Lahore</p>
            <p className="text-sm">{invoice.customerPhone}</p>
          </div>
          
          <div className="w-1/3">
             <h2 className="bg-gray-200 text-center font-bold py-1 mb-2">SALE INVOICE</h2>
             <div className="grid grid-cols-2 text-sm gap-y-1">
                <span className="font-bold">Invoice #</span>
                <span className="text-right">{invoice.invoiceNumber}</span>
                <span className="font-bold">Invoice Date</span>
                <span className="text-right">{formatDate(invoice.createdAt)}</span>
             </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-y-2 border-black bg-gray-50">
              <th className="text-left py-2 px-2 uppercase text-sm">Description</th>
              <th className="text-center py-2 px-2 uppercase text-sm">Qty</th>
              <th className="text-center py-2 px-2 uppercase text-sm">Rate</th>
              <th className="text-right py-2 px-2 uppercase text-sm">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="py-3 px-2 font-medium">{item.name}</td>
                <td className="py-3 px-2 text-center">{item.quantity}</td>
                <td className="py-3 px-2 text-center">{item.price.toLocaleString()}</td>
                <td className="py-3 px-2 text-right">{ (item.price * item.quantity).toLocaleString() }</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-between items-start border-t-2 border-dashed border-black pt-4">
          <div className="w-1/2">
             <h4 className="font-bold underline mb-2">Other Outlets:</h4>
             <ul className="text-xs space-y-1">
                <li>• Shahzad Trading</li>
                <li>• Butt Brothers</li>
                <li>• Saad Bin Abi Waqas</li>
                <li>• Electric Avenue</li>
             </ul>
          </div>

          <div className="w-1/3 space-y-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>PKR {invoice.subTotal.toLocaleString()}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Advance/Discount</span>
                <span>PKR -{invoice.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-xl border-t border-black pt-2">
              <span>Balance Due</span>
              <span>PKR {invoice.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer: Terms and Thank You */}
        <div className="mt-12 grid grid-cols-2 gap-8 items-end">
          <div className="text-[10px] border border-gray-300 p-2 rounded">
            <h4 className="font-bold bg-gray-200 px-2 py-1 mb-2">Terms & Conditions:</h4>
            <ol className="list-decimal ml-4 space-y-1">
              <li>All Prices are exclusive of Bulbs & Delivery Charges</li>
              <li>Good Cannot be exchanged or returned</li>
              <li>Confirm Order at the time of delivery</li>
              <li>No Damaged items returned or discussed after delivery confirmed</li>
              <li>Token Money Valid for 10 Days</li>
            </ol>
          </div>
          
          <div className="text-right italic">
            <p className="text-sm">On behalf of Light Craft,</p>
            <h2 className="text-2xl font-serif font-bold text-green-700">Thank You</h2>
            <p className="text-[10px] mt-2">Please let us know if there's any other work we can help you with.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
