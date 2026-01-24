import { TrendingUp, AlertTriangle, Banknote, Package } from "lucide-react";
import { cn } from "@/lib/utils";

type StatVariant = "sales" | "items" | "alert";

interface StatCardProps {
  variant: StatVariant;
  label: string;
  value: string;
  trend?: string;
  urgent?: boolean;
}

const variantConfig = {
  sales: {
    icon: Banknote,
    bgIcon: "bg-success-muted",
    textIcon: "text-success",
    trendColor: "text-success",
  },
  items: {
    icon: Package,
    bgIcon: "bg-primary/10",
    textIcon: "text-primary",
    trendColor: "text-primary",
  },
  alert: {
    icon: AlertTriangle,
    bgIcon: "bg-destructive-muted",
    textIcon: "text-destructive",
    trendColor: "text-destructive",
  },
};

export function StatCard({ variant, label, value, trend, urgent }: StatCardProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl p-6 bg-card border border-border shadow-sm",
        urgent && "border-l-4 border-l-destructive"
      )}
    >
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-xl", config.bgIcon)}>
          <Icon className={cn("h-7 w-7", config.textIcon)} />
        </div>
        {trend && (
          <span className={cn("text-sm font-bold flex items-center gap-1", config.trendColor)}>
            <TrendingUp className="h-4 w-4" />
            {trend}
          </span>
        )}
        {urgent && (
          <span className="text-destructive text-sm font-bold">Urgent</span>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-foreground text-3xl font-extrabold mt-1">{value}</p>
      </div>
    </div>
  );
}
