import { useState } from "react";
import { Receipt } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProductSearch, type Product } from "@/components/pos/ProductSearch";
import { CartTable, type CartItem } from "@/components/pos/CartTable";
import { InvoiceSummary, type CustomerInfo, type PaymentMethod } from "@/components/pos/InvoiceSummary";
import { createInvoice, type Invoice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
// Import logos for print
import lightCraftLogo from "@/assets/logo.ico";
import oxfordLogo from "@/assets/oxford-logo.png";

const NewInvoice = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleAddProduct = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      
      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.sellingPrice ?? 0, // Default to 0 if no selling price
        quantity,
      };
      
      return [...prev, newItem];
    });

    toast({
      title: "Added to invoice",
      description: `${quantity}x ${product.name}`,
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, price: newPrice } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSaveInvoice = async (
    customerInfo: CustomerInfo,
    discountAmount: number, 
    paymentMethod: PaymentMethod,
    shouldPrint: boolean
  ) => {
    setIsProcessing(true);
    
    try {
      const payload = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || undefined,
        items: cartItems.map((item) => ({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        discountAmount: discountAmount,
        taxRate: 0,
        paymentMethod,
      };

      const savedInvoice = await createInvoice(payload);

      if (shouldPrint) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(generatePrintableInvoice(savedInvoice, lightCraftLogo, oxfordLogo));
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      }

      toast({
        title: "Invoice saved!",
        description: `Invoice ${savedInvoice.invoiceNumber} has been saved${shouldPrint ? " and sent to printer" : ""}.`,
      });

      setCartItems([]);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndPrint = async (customerInfo: CustomerInfo, discountAmount: number, paymentMethod: PaymentMethod) => {
    await handleSaveInvoice(customerInfo, discountAmount, paymentMethod, true);
  };

  const handleSaveOnly = async (customerInfo: CustomerInfo, discountAmount: number, paymentMethod: PaymentMethod) => {
    await handleSaveInvoice(customerInfo, discountAmount, paymentMethod, false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuToggle={toggleSidebar} title="New Invoice" />

        <div className="p-4 md:p-6 lg:p-8 w-full">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Point of Sale</h1>
              <p className="text-sm text-muted-foreground">Create a new invoice for your customer</p>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Search & Cart */}
            <div className="lg:col-span-2 space-y-6">
              <ProductSearch onAddProduct={handleAddProduct} />
              <CartTable
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onUpdatePrice={handleUpdatePrice}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <InvoiceSummary
                  items={cartItems}
                  onSaveAndPrint={handleSaveAndPrint}
                  onSaveOnly={handleSaveOnly}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper function to generate printable invoice HTML with proper image URLs
function generatePrintableInvoice(invoice: Invoice, lightCraftLogoUrl: string, oxfordLogoUrl: string): string {
  const date = new Date(invoice.createdAt).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.price.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  const discountAmount = invoice.discountAmount || 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; font-size: 12px; color: #000; background: #fff; }
        .top-section { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; margin-bottom: 20px; }
        .logo-left { display: flex; justify-content: flex-start; align-items: center; }
        .logo-left img { height: 90px; width: 90px; object-fit: contain; }
        .logo-center { display: flex; justify-content: center; align-items: center; }
        .logo-center img { height: 75px; width: auto; max-width: 180px; object-fit: contain; }
        .outlet-details { text-align: right; font-size: 11px; }
        .outlet-details h3 { background: #e5e5e5; padding: 4px 10px; display: inline-block; margin-bottom: 8px; font-size: 12px; }
        .company-title { text-align: center; margin-bottom: 20px; }
        .company-title h1 { font-size: 28px; margin: 0; letter-spacing: 2px; font-weight: 900; }
        .company-title p { color: #666; margin: 5px 0 0; font-size: 11px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .sold-to h3 { background: #333; color: white; padding: 4px 10px; display: inline-block; margin-bottom: 8px; font-size: 11px; }
        .invoice-box h2 { background: #333; color: white; padding: 6px 10px; text-align: center; margin-bottom: 8px; font-size: 12px; }
        .invoice-box table { width: 100%; font-size: 11px; }
        .invoice-box td { padding: 4px 0; }
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.items th { background: #f0f0f0; padding: 8px; text-align: left; border-top: 2px solid #999; border-bottom: 2px solid #999; font-size: 11px; }
        table.items td { padding: 8px; border-bottom: 1px solid #eee; }
        .totals { text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #999; }
        .totals table { margin-left: auto; width: 250px; }
        .totals td { padding: 4px 8px; }
        .totals .balance { font-size: 16px; font-weight: bold; border-top: 1px solid #ccc; padding-top: 8px; }
        .footer { display: flex; justify-content: space-between; margin-top: 30px; align-items: flex-end; }
        .terms { border: 1px solid #ccc; padding: 10px; width: 55%; font-size: 10px; }
        .terms h4 { background: #e5e5e5; padding: 4px 8px; margin: 0 0 8px; }
        .terms ol { margin: 0; padding-left: 18px; }
        .terms li { margin-bottom: 3px; color: #555; }
        .thank-you { text-align: right; }
        .thank-you .msg { color: #666; font-size: 11px; }
        .thank-you h2 { color: #16a34a; font-size: 28px; font-style: italic; margin: 5px 0; font-family: Georgia, serif; }
        .thank-you .small { font-size: 9px; color: #888; }
        @media print { body { padding: 10px; } }
      </style>
    </head>
    <body>
      <div class="top-section">
        <div class="logo-left">
          <img src="${lightCraftLogoUrl}" alt="Light Craft" />
        </div>
        <div class="logo-center">
          <img src="${oxfordLogoUrl}" alt="Oxford Next-Gen Lighting" />
        </div>
        <div class="outlet-details">
          <h3>Outlet Details:</h3>
          <p><strong>Light Craft</strong></p>
          <p>2 Beadon Road, Lahore</p>
          <p>Hamza Butt: 0320-9497474</p>
          <p>Haider Butt: 0311-7722070</p>
          <p style="margin-top: 8px;"><strong>Other Outlets:</strong></p>
          <p>1- Shahzad Trading</p>
          <p>2- Butt Brothers</p>
          <p>3- Saad Bin Abi Waqas</p>
          <p>4- Electric Avenue</p>
        </div>
      </div>
      
      <div class="company-title">
        <h1>LIGHT CRAFT</h1>
        <p>Deal In COB, SMD & All Indoor OutDoor Lights</p>
      </div>
      
      <div class="info-section">
        <div class="sold-to">
          <h3>Sold to:</h3>
          <p style="font-weight: bold; font-size: 14px;">${invoice.customerName}</p>
          <p>Lahore</p>
          <p>${invoice.customerPhone || "—"}</p>
        </div>
        <div class="invoice-box" style="width: 200px;">
          <h2>SALE INVOICE</h2>
          <table>
            <tr><td><strong>Invoice #</strong></td><td style="text-align: right;">${invoice.invoiceNumber}</td></tr>
            <tr><td><strong>Invoice Date</strong></td><td style="text-align: right;">${date}</td></tr>
          </table>
        </div>
      </div>
      
      <table class="items">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: center;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="totals">
        <table>
          <tr><td><strong>Total</strong></td><td style="text-align: right;">PKR ${invoice.subTotal.toLocaleString()}</td></tr>
          <tr><td>Discount</td><td style="text-align: right;">PKR -${discountAmount.toLocaleString()}</td></tr>
          <tr class="balance"><td><strong>Balance Due</strong></td><td style="text-align: right;"><strong>PKR ${invoice.grandTotal.toLocaleString()}</strong></td></tr>
        </table>
      </div>
      
      <div class="footer">
        <div class="terms">
          <h4>Terms & Conditions:</h4>
          <ol>
            <li>All Prices are exclusive of Bulbs & Delivery Charges</li>
            <li>Goods Cannot be exchanged or returned</li>
            <li>Confirm Order at the time of delivery</li>
            <li>No Damaged items returned or discussed after delivery confirmed</li>
            <li>Token Money Valid for 10 Days</li>
          </ol>
        </div>
        <div class="thank-you">
          <p class="msg">On behalf of Light Craft,</p>
          <p class="msg">we wanted to say</p>
          <h2>Thank</h2>
          <h2>You</h2>
          <p class="small">for choosing us.</p>
          <p class="small">Please let us know if there's any other work we can help you with.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default NewInvoice;
