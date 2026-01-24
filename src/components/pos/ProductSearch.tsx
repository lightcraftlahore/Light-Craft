import { useState, useRef, useEffect } from "react";
import { Search, Plus, Barcode } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  currentStock: number;
}

const mockProducts: Product[] = [
  { id: "1", name: "12W LED Bulb", sku: "LED-12W-001", sellingPrice: 250, currentStock: 450 },
  { id: "2", name: "9W LED Bulb", sku: "LED-9W-002", sellingPrice: 180, currentStock: 320 },
  { id: "3", name: "Flood Light 50W", sku: "FL-50W-001", sellingPrice: 1500, currentStock: 25 },
  { id: "4", name: "Strip Light 5m", sku: "SL-5M-001", sellingPrice: 600, currentStock: 8 },
  { id: "5", name: "Panel Light 18W", sku: "PL-18W-001", sellingPrice: 800, currentStock: 120 },
  { id: "6", name: "Downlight 12W", sku: "DL-12W-001", sellingPrice: 500, currentStock: 200 },
  { id: "7", name: "Tube Light 20W", sku: "TL-20W-001", sellingPrice: 350, currentStock: 15 },
  { id: "8", name: "Street Light 100W", sku: "STL-100W-001", sellingPrice: 4500, currentStock: 45 },
];

interface ProductSearchProps {
  onAddProduct: (product: Product, quantity: number) => void;
}

export function ProductSearch({ onAddProduct }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = query.length > 0
    ? mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.sku.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredProducts.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredProducts.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
        break;
      case "Enter":
        e.preventDefault();
        handleAddProduct(filteredProducts[selectedIndex]);
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleAddProduct = (product: Product) => {
    if (product.currentStock < quantity) {
      return; // Not enough stock
    }
    onAddProduct(product, quantity);
    setQuery("");
    setQuantity(1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-sm">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Barcode className="h-5 w-5 text-primary" />
        Add Products
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="flex items-center h-12 rounded-xl bg-secondary overflow-hidden border-2 border-transparent focus-within:border-primary transition-colors">
            <div className="flex items-center justify-center pl-4 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-full bg-transparent border-none text-foreground placeholder:text-muted-foreground px-3 text-base font-normal focus:outline-none"
              placeholder="Search by product name or scan barcode..."
            />
          </div>

          {/* Dropdown */}
          {isOpen && filteredProducts.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {filteredProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                    index === selectedIndex ? "bg-primary/10" : "hover:bg-secondary",
                    index !== filteredProducts.length - 1 && "border-b border-border"
                  )}
                >
                  <div>
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">Rs. {product.sellingPrice.toLocaleString()}</p>
                    <p className={cn(
                      "text-xs",
                      product.currentStock <= 10 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {product.currentStock} in stock
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isOpen && query.length > 0 && filteredProducts.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-4 text-center text-muted-foreground">
              No products found
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Qty:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="w-20 h-12 px-3 rounded-xl bg-secondary border-2 border-transparent text-foreground text-center font-bold focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Quick Add Button (mobile) */}
        <button
          onClick={() => {
            if (filteredProducts.length > 0) {
              handleAddProduct(filteredProducts[0]);
            }
          }}
          disabled={filteredProducts.length === 0}
          className="sm:hidden flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        💡 Tip: Type product name or scan barcode, then press Enter to add
      </p>
    </div>
  );
}
