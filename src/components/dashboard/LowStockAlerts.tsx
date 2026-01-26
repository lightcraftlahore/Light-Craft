import { Link } from "react-router-dom";
import { AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LowStockProduct } from "@/lib/api";

interface LowStockAlertsProps {
  products: LowStockProduct[];
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  return (
    <div className="bg-card rounded-2xl border border-border border-l-4 border-l-destructive overflow-hidden shadow-sm">
      <div className="px-4 md:px-6 py-5 border-b border-border flex justify-between items-center">
        <h2 className="text-foreground text-lg md:text-xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Low Stock Alerts
        </h2>
        <Link to="/inventory" className="text-primary text-sm font-bold hover:underline">
          View Inventory
        </Link>
      </div>

      <div className="divide-y divide-border">
        {products.map((product) => (
          <div
            key={product._id}
            className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
          >
            {/* Product Image */}
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
              {product.image?.url ? (
                <img
                  src={product.image.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
            </div>

            {/* Stock Badge */}
            <div
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-bold",
                product.stock <= 0
                  ? "bg-destructive/10 text-destructive"
                  : product.stock <= 5
                  ? "bg-warning-muted text-warning"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {product.stock} left
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
