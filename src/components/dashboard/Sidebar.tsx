import { LayoutDashboard, Package, FileText, X, LogOut, ExternalLink } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@/assets/logo.ico";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
            <div className="rounded-lg overflow-hidden flex items-center justify-center w-10 h-10">
              <img src={logoImage} alt="Light Craft Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground text-lg font-bold leading-tight">Light Craft</h1>
              <p className="text-muted-foreground text-xs font-medium">Lahore</p>
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

        {/* User Profile & Developer Credit */}
        <div className="mt-auto">
          {/* User Profile */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="rounded-full h-10 w-10 bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {user ? getInitials(user.name) : "?"}
                </span>
              </div>
              <div className="flex flex-col overflow-hidden flex-1">
                <p className="text-sm font-bold truncate">{user?.name || "Guest"}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {user?.role || "Unknown"} Account
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Developer Credit */}
          <div className="px-6 pb-4">
            <a
              href="https://codeenvision.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border border-primary/10 transition-all duration-300"
            >
              <span className="text-[10px] text-muted-foreground">Developed by</span>
              <span className="text-[10px] font-semibold text-primary">Code Envision Technologies</span>
              <ExternalLink className="h-2.5 w-2.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
