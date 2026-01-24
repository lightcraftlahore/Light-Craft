import { cn } from "@/lib/utils";

export type InvoiceStatus = "Paid" | "Pending";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: {
    name: string;
    sku: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  status: InvoiceStatus;
}

export const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-20231027-001",
    date: "2023-10-27",
    customerName: "Ali Hassan",
    customerPhone: "0300-1234567",
    items: [
      { name: "12W LED Bulb", sku: "LED-12W-001", price: 250, quantity: 50 },
    ],
    subtotal: 12500,
    tax: 0,
    grandTotal: 12500,
    status: "Paid",
  },
  {
    id: "2",
    invoiceNumber: "INV-20231027-002",
    date: "2023-10-27",
    customerName: "Karachi Electronics",
    customerPhone: "021-5678901",
    items: [
      { name: "9W LED Bulb", sku: "LED-9W-002", price: 180, quantity: 100 },
    ],
    subtotal: 18000,
    tax: 0,
    grandTotal: 18000,
    status: "Paid",
  },
  {
    id: "3",
    invoiceNumber: "INV-20231026-001",
    date: "2023-10-26",
    customerName: "M. Usman Traders",
    customerPhone: "0321-9876543",
    items: [
      { name: "Flood Light 50W", sku: "FL-50W-001", price: 1500, quantity: 5 },
      { name: "Panel Light 18W", sku: "PL-18W-001", price: 800, quantity: 10 },
    ],
    subtotal: 15500,
    tax: 0,
    grandTotal: 15500,
    status: "Pending",
  },
  {
    id: "4",
    invoiceNumber: "INV-20231026-002",
    date: "2023-10-26",
    customerName: "Zeeshan Lights",
    customerPhone: "0333-4567890",
    items: [
      { name: "Strip Light 5m", sku: "SL-5M-001", price: 600, quantity: 20 },
    ],
    subtotal: 12000,
    tax: 0,
    grandTotal: 12000,
    status: "Paid",
  },
  {
    id: "5",
    invoiceNumber: "INV-20231025-001",
    date: "2023-10-25",
    customerName: "Lahore Electric Store",
    customerPhone: "042-1112233",
    items: [
      { name: "12W LED Bulb", sku: "LED-12W-001", price: 250, quantity: 40 },
      { name: "9W LED Bulb", sku: "LED-9W-002", price: 180, quantity: 30 },
      { name: "Downlight 12W", sku: "DL-12W-001", price: 500, quantity: 15 },
    ],
    subtotal: 22100,
    tax: 0,
    grandTotal: 22100,
    status: "Paid",
  },
  {
    id: "6",
    invoiceNumber: "INV-20231024-001",
    date: "2023-10-24",
    customerName: "Faisal Electricals",
    customerPhone: "0345-6789012",
    items: [
      { name: "Street Light 100W", sku: "STL-100W-001", price: 4500, quantity: 8 },
    ],
    subtotal: 36000,
    tax: 0,
    grandTotal: 36000,
    status: "Paid",
  },
  {
    id: "7",
    invoiceNumber: "INV-20231023-001",
    date: "2023-10-23",
    customerName: "Ahmed Traders",
    customerPhone: "0312-3456789",
    items: [
      { name: "Tube Light 20W", sku: "TL-20W-001", price: 350, quantity: 25 },
    ],
    subtotal: 8750,
    tax: 0,
    grandTotal: 8750,
    status: "Pending",
  },
  {
    id: "8",
    invoiceNumber: "INV-20231022-001",
    date: "2023-10-22",
    customerName: "Bright Lights Co.",
    customerPhone: "0300-9876543",
    items: [
      { name: "Panel Light 18W", sku: "PL-18W-001", price: 800, quantity: 30 },
      { name: "Downlight 12W", sku: "DL-12W-001", price: 500, quantity: 20 },
    ],
    subtotal: 34000,
    tax: 0,
    grandTotal: 34000,
    status: "Paid",
  },
];

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
