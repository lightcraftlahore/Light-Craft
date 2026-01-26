import { cn } from "@/lib/utils";

export type InvoiceStatus = "Paid" | "Pending";

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
        status === "Paid"
          ? "bg-success-muted text-success"
          : "bg-warning-muted text-warning"
      )}
    >
      {status}
    </span>
  );
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
