import { Search, Bell, Settings, Menu } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
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
          Dashboard Overview
        </h2>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex items-center min-w-64 h-11 rounded-xl bg-secondary overflow-hidden">
          <div className="flex items-center justify-center pl-4 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="flex-1 h-full bg-transparent border-none text-foreground placeholder:text-muted-foreground px-4 pl-2 text-base font-normal focus:outline-none"
            placeholder="Search invoices, customers..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile search button */}
        <button className="md:hidden flex items-center justify-center rounded-xl h-10 w-10 bg-secondary text-foreground transition-all hover:bg-secondary/80">
          <Search className="h-5 w-5" />
        </button>
        <button className="flex items-center justify-center rounded-xl h-10 w-10 md:h-11 md:w-11 bg-secondary text-foreground transition-all hover:bg-secondary/80">
          <Bell className="h-5 w-5" />
        </button>
        <button className="flex items-center justify-center rounded-xl h-10 w-10 md:h-11 md:w-11 bg-secondary text-foreground transition-all hover:bg-secondary/80">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
