import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, PlusCircle } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { InvoiceList } from "@/components/invoices/InvoiceList";

const Invoices = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuToggle={toggleSidebar} title="Invoices" />

        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Invoice History</h1>
                <p className="text-sm text-muted-foreground">View and manage all your past invoices</p>
              </div>
            </div>
            <Link
              to="/sales/new"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              <PlusCircle className="h-5 w-5" />
              New Invoice
            </Link>
          </div>

          {/* Invoice List */}
          <InvoiceList />
        </div>
      </main>
    </div>
  );
};

export default Invoices;
