import { useState } from "react";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { GlobalSearch } from "./GlobalSearch";

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title = "Dashboard Overview" }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      
      <header className="sticky top-0 z-10 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-8 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h2 className="text-foreground text-lg md:text-xl font-bold tracking-tight">
            {title}
          </h2>

          {/* Search Bar - Desktop (clickable to open command) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center min-w-64 h-11 rounded-xl bg-secondary overflow-hidden hover:bg-secondary/80 transition-colors group"
          >
            <div className="flex items-center justify-center pl-4 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <span className="flex-1 h-full bg-transparent text-muted-foreground px-4 pl-2 text-sm text-left">
              Search invoices, customers...
            </span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 mr-3 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile search button */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="md:hidden flex items-center justify-center rounded-xl h-10 w-10 bg-secondary text-foreground transition-all hover:bg-secondary/80"
          >
            <Search className="h-5 w-5" />
          </button>
         
          <Link
            to="/settings"
            className="flex items-center justify-center rounded-xl h-10 w-10 md:h-11 md:w-11 bg-secondary text-foreground transition-all hover:bg-secondary/80"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>
    </>
  );
}
