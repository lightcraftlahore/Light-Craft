import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import { getDashboardStats, type DashboardStats } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch dashboard stats",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuToggle={toggleSidebar} />

        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6 md:space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                  variant="sales"
                  label="Total Sales Today"
                  value={`Rs. ${(stats?.totalSalesToday || 0).toLocaleString()}`}
                  trend={stats?.totalInvoicesToday ? `${stats.totalInvoicesToday} invoices` : undefined}
                />
                <StatCard
                  variant="items"
                  label="Items Sold Today"
                  value={`${stats?.totalItemsSold || 0} Units`}
                />
                <StatCard
                  variant="alert"
                  label="Low Stock Alerts"
                  value={`${stats?.lowStockAlerts?.length || 0} Items`}
                  urgent={(stats?.lowStockAlerts?.length || 0) > 0}
                />
              </div>

              {/* Action Buttons */}
              <ActionButtons />

              {/* Low Stock Alerts */}
              {stats?.lowStockAlerts && stats.lowStockAlerts.length > 0 && (
                <LowStockAlerts products={stats.lowStockAlerts} />
              )}

              {/* Recent Activity Table */}
              <RecentActivity invoices={stats?.recentActivity || []} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
