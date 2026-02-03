import { useState, useRef, useEffect } from "react";
import { Search, Plus, Barcode, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProducts, type Product as ApiProduct } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number | null;
  currentStock: number;
}

interface ProductSearchProps {
  onAddProduct: (product: Product, quantity: number) => void;
}

export function ProductSearch({ onAddProduct }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch products when query changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (query.length === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const response = await getProducts(query);
        const mappedProducts: Product[] = response.products.map((p: ApiProduct) => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          sellingPrice: p.sellingPrice ?? null,
          currentStock: p.stock,
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 200);
    return () => clearTimeout(debounce);
  }, [query]);

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
    if (!isOpen || products.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % products.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + products.length) % products.length);
        break;
      case "Enter":
        e.preventDefault();
        handleAddProduct(products[selectedIndex]);
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
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
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
              placeholder="Search by product name or SKU..."
            />
          </div>

          {/* Dropdown */}
          {isOpen && products.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {products.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                    index === selectedIndex ? "bg-primary/10" : "hover:bg-secondary",
                    index !== products.length - 1 && "border-b border-border"
                  )}
                >
                  <div>
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{product.sellingPrice ? `Rs. ${product.sellingPrice.toLocaleString()}` : <span className="text-muted-foreground text-xs">No price set</span>}</p>
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

          {isOpen && query.length > 0 && !loading && products.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-4 text-center text-muted-foreground">
              No products found
            </div>
          )}
        </div>

        

        {/* Quick Add Button (mobile) */}
        <button
          onClick={() => {
            if (products.length > 0) {
              handleAddProduct(products[0]);
            }
          }}
          disabled={products.length === 0}
          className="sm:hidden flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        💡 Tip: Type product name or SKU, then press Enter to add
      </p>
    </div>
  );
}
