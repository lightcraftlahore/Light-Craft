import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, FileText, Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getProducts, getInvoices, type Product, type Invoice } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setInvoices([]);
      return;
    }

    setIsLoading(true);
    try {
      const [productsRes, invoicesRes] = await Promise.all([
        getProducts(searchQuery),
        getInvoices({ customerName: searchQuery }),
      ]);

      setProducts(productsRes.products.slice(0, 5));
      setInvoices(invoicesRes.slice(0, 5));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleSelect = (type: "product" | "invoice", id: string) => {
    onOpenChange(false);
    setQuery("");
    if (type === "product") {
      navigate(`/inventory/edit/${id}`);
    } else {
      navigate(`/invoices/${id}`);
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search products, invoices, customers..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
          </div>
        ) : (
          <>
            <CommandEmpty>
              {query ? "No results found." : "Start typing to search..."}
            </CommandEmpty>

            {products.length > 0 && (
              <CommandGroup heading="Products">
                {products.map((product) => (
                  <CommandItem
                    key={product._id}
                    value={`product-${product._id}`}
                    onSelect={() => handleSelect("product", product._id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {product.image?.url ? (
                        <img
                          src={product.image.url}
                          alt={product.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {invoices.length > 0 && (
              <CommandGroup heading="Invoices">
                {invoices.map((invoice) => (
                  <CommandItem
                    key={invoice._id}
                    value={`invoice-${invoice._id}`}
                    onSelect={() => handleSelect("invoice", invoice._id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {invoice.customerName}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-primary">
                        {invoice.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}