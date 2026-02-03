import { Minus, Plus, Trash2, ShoppingCart, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

interface CartTableProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onUpdatePrice: (itemId: string, newPrice: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartTable({ items, onUpdateQuantity, onUpdatePrice, onRemoveItem }: CartTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="p-4 rounded-full bg-secondary mb-4">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Cart is Empty</h3>
        <p className="text-muted-foreground text-center">
          Search for products above to add them to this invoice
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-4 md:px-6 py-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Invoice Items
          <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
            {items.length}
          </span>
        </h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Item</th>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold text-center">Price (Rs.)</th>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold text-center">Quantity</th>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold text-right">Subtotal</th>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        onUpdatePrice(item.id, Math.max(0, val));
                      }}
                      min="0"
                      className="w-24 h-10 text-center font-bold bg-secondary rounded-lg border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        onUpdateQuantity(item.id, Math.max(1, val));
                      }}
                      min="1"
                      className="w-16 h-10 text-center font-bold bg-secondary rounded-lg border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-primary">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            {/* Price Input for Mobile */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Price:</span>
              <input
                type="number"
                value={item.price}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onUpdatePrice(item.id, Math.max(0, val));
                }}
                min="0"
                className="w-24 h-9 text-center font-bold bg-secondary rounded-lg border-2 border-transparent focus:border-primary focus:outline-none text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 rounded-lg bg-secondary disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-2 rounded-lg bg-secondary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="font-bold text-primary">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
