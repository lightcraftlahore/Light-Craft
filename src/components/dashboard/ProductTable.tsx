import { useState, useEffect } from "react";
import { Pencil, Trash2, Search, ArrowUpDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct, Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SortField = "name" | "sku" | "costPrice" | "sellingPrice" | "stock";
type SortDirection = "asc" | "desc";

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await getProducts(debouncedSearch || undefined, currentPage);
        setProducts(response.products);
        setTotalPages(response.pages);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch products",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, currentPage, toast]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * modifier;
    }
    return ((aValue as number) - (bValue as number)) * modifier;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock <= 10) return "critical";
    if (product.stock <= 25) return "low";
    return "sufficient";
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been removed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold w-16">Image</th>
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
                  label="Stock"
                  field="stock"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedProducts.map((product) => (
                <tr key={product._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    {product.image?.url ? (
                      <img
                        src={product.image.url}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">{product.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{product.sku}</td>
                  <td className="px-6 py-4 text-sm">Rs. {product.costPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">
                    Rs. {product.sellingPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StockBadge status={getStockStatus(product)} value={product.stock} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/inventory/edit/${product._id}`}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product)}
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
          {sortedProducts.map((product) => (
            <div key={product._id} className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-3">
                {product.image?.url ? (
                  <img
                    src={product.image.url}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-xs flex-shrink-0">
                    N/A
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate">{product.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{product.sku}</p>
                </div>
                <StockBadge status={getStockStatus(product)} value={product.stock} />
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
                  to={`/inventory/edit/${product._id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteClick(product)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedProducts.length === 0 && !isLoading && (
          <div className="p-8 text-center text-muted-foreground">
            No products found matching your search.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
        status === "critical" && "bg-destructive/10 text-destructive",
        status === "low" && "bg-yellow-500/10 text-yellow-600",
        status === "sufficient" && "bg-green-500/10 text-green-600"
      )}
    >
      {value} units
    </span>
  );
}