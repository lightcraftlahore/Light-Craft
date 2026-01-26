import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";
import { getInvoiceById, type Invoice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch invoice",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, toast]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto print:overflow-visible">
        <div className="print:hidden">
          <Header onMenuToggle={toggleSidebar} title="Invoice Details" />
        </div>

        <div className="p-4 md:p-8 w-full print:p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invoice ? (
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
