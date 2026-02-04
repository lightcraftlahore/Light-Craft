import { Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/data/invoices";
import type { Invoice } from "@/lib/api";
// Import logos
import lightCraftLogo from "@/assets/logo.ico";
import oxfordLogo from "@/assets/oxford-logo.png";

interface InvoiceDetailProps {
  invoice: Invoice;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  // Calculate discount safely 
  const discountOrAdvance = invoice?.discountAmount || 0;

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
      <div className="bg-white p-8 rounded-2xl border border-border shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none text-black print:p-4">
        
        {/* Top Branding Section - Updated Logo Sizes and Oxford Placement */}
        <div className="grid grid-cols-3 items-start mb-6">
          {/* Left - Light Craft Logo */}
          <div className="flex justify-start items-center">
            <img 
              src={lightCraftLogo} 
              alt="Light Craft" 
              className="h-28 w-28 object-contain print:h-24 print:w-24" 
            />
          </div>

          {/* Center - Oxford Logo (prominent) */}
          <div className="flex justify-center items-center">
            <img 
              src={oxfordLogo} 
              alt="Oxford Next-Gen Lighting" 
              className="h-24 w-auto max-w-[220px] object-contain print:h-20 print:max-w-[180px]" 
            />
          </div>
          
          {/* Right - Outlet Details [cite: 2, 7] */}
          <div className="text-right text-sm">
            <h3 className="font-bold text-base bg-gray-200 px-3 py-1 rounded inline-block mb-2">Outlet Details:</h3>
            <p className="font-semibold">Light Craft</p>
            <p>2 Beadon Road, Lahore</p>
            <div className="mt-1">
              <p>Hamza Butt: 0320-9497474</p>
              <p>Haider Butt: 0311-7722070</p>
            </div>
            <div className="mt-2 text-[10px] leading-tight">
              <p className="font-semibold underline">Other Outlets:</p>
              <p>1- Shahzad Trading</p>
              <p>2- Butt Brothers</p>
              <p>3- Saad Bin Abi Waqas</p>
              <p>4- Electric Avenue</p>
            </div>
          </div>
        </div>

        {/* Company Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black tracking-tighter">LIGHT CRAFT</h1>
          <p className="text-sm text-gray-600 font-medium">Deal In COB, SMD & All Indoor OutDoor Lights</p>
        </div>

        {/* Client and Invoice Info [cite: 5, 7] */}
        <div className="flex justify-between mb-6">
          <div className="w-1/2">
            <h3 className="bg-gray-800 text-white px-3 py-1 font-bold inline-block mb-2 text-sm uppercase">Sold to:</h3>
            <p className="font-bold text-lg">{invoice?.customerName || "Walk-in Customer"}</p>
            <p className="text-sm text-gray-600">Lahore</p>
            <p className="text-sm">{invoice?.customerPhone || "—"}</p>
          </div>
          
          <div className="w-2/5">
            <h2 className="bg-gray-800 text-white text-center font-bold py-1.5 mb-2 text-sm">SALE INVOICE</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="font-bold py-1">Invoice #</td>
                  <td className="text-right py-1 font-mono">{invoice?.invoiceNumber || "N/A"}</td>
                </tr>
                <tr>
                  <td className="font-bold py-1">Invoice Date</td>
                  <td className="text-right py-1">{invoice?.createdAt ? formatDate(invoice.createdAt) : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table [cite: 6] */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-y-2 border-gray-400 bg-gray-100">
              <th className="text-left py-2 px-2 text-sm font-bold">Description</th>
              <th className="text-center py-2 px-2 text-sm font-bold">Qty</th>
              <th className="text-center py-2 px-2 text-sm font-bold">Rate</th>
              <th className="text-right py-2 px-2 text-sm font-bold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice?.items?.map((item, index) => (
              <tr key={index}>
                <td className="py-2.5 px-2 font-medium">{item.name}</td>
                <td className="py-2.5 px-2 text-center">{item.quantity}</td>
                <td className="py-2.5 px-2 text-center">{item.price?.toLocaleString()}</td>
                <td className="py-2.5 px-2 text-right font-medium">{(item.price * item.quantity)?.toLocaleString()}</td>
              </tr>
            ))}
            {/* Maintaining table height */}
            {(invoice?.items?.length || 0) < 5 && Array.from({ length: 5 - (invoice?.items?.length || 0) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="py-2.5 px-2">&nbsp;</td>
                <td className="py-2.5 px-2"></td>
                <td className="py-2.5 px-2"></td>
                <td className="py-2.5 px-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section [cite: 8, 10] */}
        <div className="border-t-2 border-dashed border-gray-400 pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold">Total</span>
                <span>PKR {invoice?.subTotal?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span>PKR -{discountOrAdvance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-xl border-t border-gray-300 pt-2 mt-2">
                <span>Balance Due</span>
                <span>PKR {invoice?.grandTotal?.toLocaleString() || "0"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Terms and Thank You */}
        <div className="mt-12 grid grid-cols-2 gap-6 items-end">
          <div className="text-[10px] border border-gray-300 p-3 rounded">
            <h4 className="font-bold bg-gray-200 px-2 py-1 mb-2 text-xs">Terms & Conditions:</h4>
            <ol className="list-decimal ml-4 space-y-0.5 text-gray-700">
              <li>All Prices are exclusive of Bulbs & Delivery Charges</li>
              <li>Goods Cannot be exchanged or returned</li>
              <li>Confirm Order at the time of delivery</li>
              <li>No Damaged items returned or discussed after delivery confirmed</li>
              <li>Token Money Valid for 10 Days</li>
            </ol>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">On behalf of Light Craft,</p>
            <p className="text-sm text-gray-600 mb-1">we wanted to say</p>
            <h2 className="text-4xl font-serif font-bold italic text-green-700 leading-none">Thank</h2>
            <h2 className="text-4xl font-serif font-bold italic text-green-700 leading-none mb-2">You</h2>
            <p className="text-xs text-gray-500">for choosing us.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
