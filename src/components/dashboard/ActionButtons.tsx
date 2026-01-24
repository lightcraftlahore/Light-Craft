import { PlusCircle, PackagePlus } from "lucide-react";
import { Link } from "react-router-dom";

export function ActionButtons() {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Link
        to="/sales/new"
        className="flex min-w-[160px] md:min-w-[180px] items-center justify-center gap-3 rounded-xl h-12 md:h-14 px-6 md:px-8 bg-primary text-primary-foreground text-base md:text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
      >
        <PlusCircle className="h-5 w-5" />
        <span>New Invoice</span>
      </Link>
      <Link
        to="/inventory/add"
        className="flex min-w-[160px] md:min-w-[180px] items-center justify-center gap-3 rounded-xl h-12 md:h-14 px-6 md:px-8 bg-card border-2 border-border text-foreground text-base md:text-lg font-bold hover:bg-secondary transition-colors"
      >
        <PackagePlus className="h-5 w-5" />
        <span>Add Product</span>
      </Link>
    </div>
  );
}
