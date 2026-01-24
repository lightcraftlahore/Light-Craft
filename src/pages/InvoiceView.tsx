import { useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";
import { mockInvoices } from "@/data/invoices";

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const invoice = mockInvoices.find((inv) => inv.id === id);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto print:overflow-visible">
        <div className="print:hidden">
          <Header onMenuToggle={toggleSidebar} title="Invoice Details" />
        </div>

        <div className="p-4 md:p-8 w-full print:p-0">
          {invoice ? (
            <InvoiceDetail invoice={invoice} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Invoice not found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InvoiceView;
