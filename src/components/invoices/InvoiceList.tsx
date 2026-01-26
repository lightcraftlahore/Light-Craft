import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Eye, FileText, Loader2 } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { StatusBadge, formatDate } from "@/data/invoices";
import { getInvoices, type Invoice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

type DateFilter = "all" | "today" | "7days" | "30days" | "90days" | "custom";

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const { toast } = useToast();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;

      switch (dateFilter) {
        case "today":
          startDate = startOfDay(now).toISOString();
          endDate = endOfDay(now).toISOString();
          break;
        case "7days":
          startDate = startOfDay(subDays(now, 7)).toISOString();
          endDate = endOfDay(now).toISOString();
          break;
        case "30days":
          startDate = startOfDay(subDays(now, 30)).toISOString();
          endDate = endOfDay(now).toISOString();
          break;
        case "90days":
          startDate = startOfDay(subDays(now, 90)).toISOString();
          endDate = endOfDay(now).toISOString();
          break;
        case "custom":
          if (customStartDate) startDate = startOfDay(customStartDate).toISOString();
          if (customEndDate) endDate = endOfDay(customEndDate).toISOString();
          break;
      }

      const data = await getInvoices({
        startDate,
        endDate,
        customerName: searchQuery.trim() || undefined,
      });
      setInvoices(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(debounce);
  }, [dateFilter, searchQuery, customStartDate, customEndDate]);

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

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
                placeholder="Search by customer name..."
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
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-11 px-4">
                    {customStartDate ? format(customStartDate, "MMM dd, yyyy") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-11 px-4">
                    {customEndDate ? format(customEndDate, "MMM dd, yyyy") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border text-sm">
          <div>
            <span className="text-muted-foreground">Total Invoices: </span>
            <span className="font-bold">{invoices.length}</span>
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                    <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Customer</th>
                    <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Items</th>
                    <th className="px-6 py-4 text-muted-foreground text-sm font-bold text-right">Amount</th>
                    <th className="px-6 py-4 text-muted-foreground text-sm font-bold text-center">Status</th>
                    <th className="px-6 py-4 text-muted-foreground text-sm font-bold w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-bold">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm">{formatDate(invoice.createdAt)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customerPhone || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {invoice.items.length} item{invoice.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-primary">Rs. {invoice.grandTotal.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={invoice.paymentStatus} />
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
                      <p className="text-xs text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                    </div>
                    <StatusBadge status={invoice.paymentStatus} />
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

            {invoices.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No invoices found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
