import { Lightbulb, LayoutDashboard, Package, Receipt, BarChart3, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: Receipt, label: "New Invoice", href: "/sales/new" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 rounded-lg p-2 flex items-center justify-center">
              <Lightbulb className="h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground text-lg font-bold leading-tight">LED Wholesale</h1>
              <p className="text-muted-foreground text-xs font-medium">Business Manager</p>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onToggle}
              className="lg:hidden ml-auto p-2 rounded-lg hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => onToggle()}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", !active && "text-muted-foreground")} />
                  <p className="text-sm font-semibold">{item.label}</p>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="mt-auto p-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="rounded-full h-10 w-10 bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">AS</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-bold truncate">Asif Shakoor</p>
              <p className="text-xs text-muted-foreground truncate">Owner Account</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
