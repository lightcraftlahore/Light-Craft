import { useState } from "react";
import { Receipt } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProductSearch, type Product } from "@/components/pos/ProductSearch";
import { CartTable, type CartItem } from "@/components/pos/CartTable";
import { InvoiceSummary, type CustomerInfo, type PaymentMethod } from "@/components/pos/InvoiceSummary";
import { createInvoice, type Invoice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
        price: product.sellingPrice,
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

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // --- CHANGED: Updated signature to accept discountAmount instead of taxRate ---
  const handleSaveInvoice = async (
    customerInfo: CustomerInfo,
    discountAmount: number, 
    paymentMethod: PaymentMethod,
    shouldPrint: boolean
  ) => {
    setIsProcessing(true);
    
    try {
      // --- CHANGED: Payload uses discountAmount ---
      const payload = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || undefined,
        items: cartItems.map((item) => ({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        discountAmount: discountAmount, // Explicit key matching backend
        paymentMethod,
      };

      const savedInvoice = await createInvoice(payload);

      if (shouldPrint) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(generatePrintableInvoice(savedInvoice));
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

  // --- CHANGED: Handlers pass discountAmount ---
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

// Helper function to generate printable invoice HTML
// --- CHANGED: Updated to show Discount row ---
function generatePrintableInvoice(invoice: Invoice): string {
  const date = new Date(invoice.createdAt).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}<br><small style="color: #666;">${item.sku || ""}</small></td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  // Logic to show discount row only if discount > 0
  const discountRow = invoice.discountAmount > 0 
    ? `<p style="color: #ef4444;">Discount: <strong>- Rs. ${invoice.discountAmount.toLocaleString()}</strong></p>` 
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #136dec; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .invoice-info div { }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f5f5f5; padding: 10px; text-align: left; }
        .total-section { text-align: right; font-size: 18px; }
        .grand-total { font-size: 24px; font-weight: bold; color: #136dec; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">💡 Lights Business</div>
        <p style="color: #666; margin: 5px 0;">Business Manager</p>
      </div>
      
      <div class="invoice-info">
        <div>
          <strong>Bill To:</strong><br>
          ${invoice.customerName}<br>
          ${invoice.customerPhone || "—"}
        </div>
        <div style="text-align: right;">
          <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
          <strong>Date:</strong> ${date}<br>
          <strong>Payment:</strong> ${invoice.paymentMethod}
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="total-section">
        <p>Subtotal: <strong>Rs. ${invoice.subTotal.toLocaleString()}</strong></p>
        ${discountRow}
        <p class="grand-total">Grand Total: Rs. ${invoice.grandTotal.toLocaleString()}</p>
      </div>
      
      <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
}

export default NewInvoice;
