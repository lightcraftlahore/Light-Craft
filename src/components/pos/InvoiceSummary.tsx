import { useState } from "react";
import { Printer, Save, Calculator, User, Phone, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem } from "./CartTable";

interface InvoiceSummaryProps {
  items: CartItem[];
  onSaveAndPrint: (customerInfo: CustomerInfo, taxRate: number, paymentMethod: PaymentMethod) => void;
  onSaveOnly: (customerInfo: CustomerInfo, taxRate: number, paymentMethod: PaymentMethod) => void;
  isProcessing: boolean;
}

export type PaymentMethod = "Cash" | "Card" | "Bank Transfer";

export interface CustomerInfo {
  name: string;
  phone: string;
}

export function InvoiceSummary({ items, onSaveAndPrint, onSaveOnly, isProcessing }: InvoiceSummaryProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const customerInfo: CustomerInfo = {
    name: customerName.trim() || "Walk-in Customer",
    phone: customerPhone.trim(),
  };

  const canSave = items.length > 0 && !isProcessing;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Customer Info */}
      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Customer Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name (optional)"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border-2 border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border-2 border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Payment Method
        </h3>
        <div className="flex gap-2">
          {(["Cash", "Card", "Bank Transfer"] as PaymentMethod[]).map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                paymentMethod === method
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Calculations */}
      <div className="p-4 md:p-6 space-y-3">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Invoice Summary
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items ({totalItems})</span>
            <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
          </div>

          {/* Tax Rate Input */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tax</span>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                min="0"
                max="100"
                step="0.5"
                className="w-16 h-7 px-2 rounded-lg bg-secondary border-2 border-transparent text-foreground text-center text-sm focus:outline-none focus:border-primary"
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <span className="font-medium">Rs. {taxAmount.toLocaleString()}</span>
          </div>

          <div className="border-t border-border my-3"></div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">Grand Total</span>
            <span className="text-2xl font-extrabold text-primary">
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 md:p-6 pt-0 space-y-3">
        <button
          onClick={() => onSaveAndPrint(customerInfo, taxRate, paymentMethod)}
          disabled={!canSave}
          className={cn(
            "w-full flex items-center justify-center gap-3 h-14 rounded-xl font-bold text-lg transition-all",
            canSave
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02]"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Printer className="h-5 w-5" />
          )}
          {isProcessing ? "Processing..." : "Save & Print"}
        </button>

        <button
          onClick={() => onSaveOnly(customerInfo, taxRate, paymentMethod)}
          disabled={!canSave}
          className={cn(
            "w-full flex items-center justify-center gap-3 h-12 rounded-xl font-bold transition-all",
            canSave
              ? "bg-success/10 text-success border-2 border-success/30 hover:bg-success/20"
              : "bg-secondary text-muted-foreground cursor-not-allowed border-2 border-transparent"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save Only
        </button>
      </div>
    </div>
  );
}
