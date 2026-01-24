import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Eye, FileText, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockInvoices, StatusBadge, formatDate, type Invoice } from "@/data/invoices";

type DateFilter = "all" | "today" | "7days" | "30days" | "90days";

interface InvoiceListProps {
  onViewInvoice?: (invoice: Invoice) => void;
}

export function InvoiceList({ onViewInvoice }: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "Pending">("all");

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    
    return mockInvoices.filter((invoice) => {
      // Search filter
      const matchesSearch =
        invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customerPhone.includes(searchQuery);

      // Date filter
      const invoiceDate = new Date(invoice.date);
      let matchesDate = true;
      
      switch (dateFilter) {
        case "today":
          matchesDate = invoiceDate.toDateString() === now.toDateString();
          break;
        case "7days":
          matchesDate = invoiceDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          matchesDate = invoiceDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          matchesDate = invoiceDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          matchesDate = true;
      }

      // Status filter
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [searchQuery, dateFilter, statusFilter]);

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="flex items-center h-11 rounded-xl bg-secondary overflow-hidden border-2 border-transparent focus-within:border-primary transition-colors">
              <div className="flex items-center justify-center pl-4 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-full bg-transparent border-none text-foreground placeholder:text-muted-foreground px-3 text-sm focus:outline-none"
                placeholder="Search by customer name, invoice #, or phone..."
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="h-11 px-4 rounded-xl bg-secondary border-2 border-transparent text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "Paid" | "Pending")}
              className="h-11 px-4 rounded-xl bg-secondary border-2 border-transparent text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border text-sm">
          <div>
            <span className="text-muted-foreground">Total Invoices: </span>
            <span className="font-bold">{filteredInvoices.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Amount: </span>
            <span className="font-bold text-primary">Rs. {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 md:px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoice History
          </h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Invoice #</th>
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Date</th>
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Customer</th>
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Items</th>
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold text-right">Amount</th>
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold text-center">Status</th>
                <th className="px-6 py-4 text-muted-foreground text-sm font-bold w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-bold">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(invoice.date)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{invoice.customerName}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {invoice.items.length} item{invoice.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-primary">Rs. {invoice.grandTotal.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/invoices/${invoice.id}`}
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
          {filteredInvoices.map((invoice) => (
            <Link
              key={invoice.id}
              to={`/invoices/${invoice.id}`}
              className="block p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-mono font-bold text-sm">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(invoice.date)}</p>
                </div>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">{invoice.customerName}</p>
                  <p className="text-xs text-muted-foreground">{invoice.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">Rs. {invoice.grandTotal.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <Eye className="h-3 w-3" /> View
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No invoices found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
