import { useState } from "react";
import { Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  lowStockThreshold?: number;
}

const mockProducts: Product[] = [
  { id: "1", name: "12W LED Bulb", sku: "LED-12W-001", costPrice: 120, sellingPrice: 250, currentStock: 450, lowStockThreshold: 50 },
  { id: "2", name: "9W LED Bulb", sku: "LED-9W-002", costPrice: 80, sellingPrice: 180, currentStock: 320, lowStockThreshold: 50 },
  { id: "3", name: "Flood Light 50W", sku: "FL-50W-001", costPrice: 800, sellingPrice: 1500, currentStock: 25, lowStockThreshold: 30 },
  { id: "4", name: "Strip Light 5m", sku: "SL-5M-001", costPrice: 350, sellingPrice: 600, currentStock: 8, lowStockThreshold: 20 },
  { id: "5", name: "Panel Light 18W", sku: "PL-18W-001", costPrice: 450, sellingPrice: 800, currentStock: 120, lowStockThreshold: 30 },
  { id: "6", name: "Downlight 12W", sku: "DL-12W-001", costPrice: 280, sellingPrice: 500, currentStock: 200, lowStockThreshold: 40 },
  { id: "7", name: "Tube Light 20W", sku: "TL-20W-001", costPrice: 180, sellingPrice: 350, currentStock: 15, lowStockThreshold: 25 },
  { id: "8", name: "Street Light 100W", sku: "STL-100W-001", costPrice: 2500, sellingPrice: 4500, currentStock: 45, lowStockThreshold: 10 },
];

type SortField = "name" | "sku" | "costPrice" | "sellingPrice" | "currentStock";
type SortDirection = "asc" | "desc";

interface ProductTableProps {
  onDelete?: (product: Product) => void;
}

export function ProductTable({ onDelete }: ProductTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = mockProducts
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier;
      }
      return ((aValue as number) - (bValue as number)) * modifier;
    });

  const getStockStatus = (product: Product) => {
    const threshold = product.lowStockThreshold || 20;
    if (product.currentStock <= threshold * 0.5) return "critical";
    if (product.currentStock <= threshold) return "low";
    return "sufficient";
  };

  const handleDelete = (product: Product) => {
    if (onDelete) {
      onDelete(product);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Search Header */}
      <div className="px-4 md:px-6 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-foreground text-lg md:text-xl font-bold">Product Inventory</h2>
          <div className="flex items-center w-full sm:w-auto min-w-0 sm:min-w-64 h-10 rounded-xl bg-secondary overflow-hidden">
            <div className="flex items-center justify-center pl-3 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full bg-transparent border-none text-foreground placeholder:text-muted-foreground px-3 text-sm font-normal focus:outline-none"
              placeholder="Search by name or SKU..."
            />
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary/50">
            <tr>
              <SortableHeader
                label="Product Name"
                field="name"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="SKU"
                field="sku"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Cost Price"
                field="costPrice"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Selling Price"
                field="sellingPrice"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Current Stock"
                field="currentStock"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold">{product.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{product.sku}</td>
                <td className="px-6 py-4 text-sm">Rs. {product.costPrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-primary">
                  Rs. {product.sellingPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <StockBadge status={getStockStatus(product)} value={product.currentStock} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/inventory/edit/${product.id}`}
                      className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {filteredProducts.map((product) => (
          <div key={product.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-foreground">{product.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{product.sku}</p>
              </div>
              <StockBadge status={getStockStatus(product)} value={product.currentStock} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-muted-foreground">Cost: </span>
                <span>Rs. {product.costPrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sell: </span>
                <span className="font-bold text-primary">Rs. {product.sellingPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Link
                to={`/inventory/edit/${product.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => handleDelete(product)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No products found matching your search.
        </div>
      )}
    </div>
  );
}

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentField === field;

  return (
    <th
      className="px-6 py-4 text-muted-foreground text-sm font-bold cursor-pointer hover:text-foreground transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground/50")}
        />
      </div>
    </th>
  );
}

function StockBadge({ status, value }: { status: "critical" | "low" | "sufficient"; value: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
        status === "critical" && "bg-destructive-muted text-destructive",
        status === "low" && "bg-warning-muted text-warning",
        status === "sufficient" && "bg-success-muted text-success"
      )}
    >
      {value} units
    </span>
  );
}
