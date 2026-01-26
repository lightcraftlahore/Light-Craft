import { Link } from "react-router-dom";
import { FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentInvoice } from "@/lib/api";

interface RecentActivityProps {
  invoices: RecentInvoice[];
}

export function RecentActivity({ invoices }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-4 md:px-6 py-5 border-b border-border flex justify-between items-center">
        <h2 className="text-foreground text-lg md:text-xl font-bold">Recent Activity</h2>
        <Link to="/invoices" className="text-primary text-sm font-bold hover:underline">
          View All
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No recent activity</p>
          <p className="text-sm">Create your first invoice to see it here</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Invoice #</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Date</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Customer Name</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Amount</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Created By</th>
                  <th className="px-6 py-4 text-muted-foreground text-sm font-bold w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-bold">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatDate(invoice.createdAt)}</td>
                    <td className="px-6 py-4 text-sm font-bold">{invoice.customerName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">
                      Rs. {invoice.grandTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {invoice.creator?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {invoices.map((invoice) => (
              <Link
                key={invoice._id}
                to={`/invoices/${invoice._id}`}
                className="block p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-mono font-bold text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success">
                    Paid
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">{invoice.customerName}</p>
                    <p className="text-xs text-muted-foreground">{invoice.creator?.name || "—"}</p>
                  </div>
                  <p className="font-bold text-primary">Rs. {invoice.grandTotal.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
