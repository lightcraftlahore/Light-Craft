import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuToggle={toggleSidebar} />

        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6 md:space-y-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard
              variant="sales"
              label="Total Sales Today"
              value="Rs. 45,000"
              trend="+12%"
            />
            <StatCard
              variant="items"
              label="Items Sold"
              value="128 Units"
              trend="+5%"
            />
            <StatCard
              variant="alert"
              label="Low Stock Alerts"
              value="4 Items"
              urgent
            />
          </div>

          {/* Action Buttons */}
          <ActionButtons />

          {/* Recent Activity Table */}
          <RecentActivity />
        </div>
      </main>
    </div>
  );
};

export default Index;
