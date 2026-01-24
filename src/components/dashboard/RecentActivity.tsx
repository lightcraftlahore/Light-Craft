import { cn } from "@/lib/utils";

interface ActivityItem {
  date: string;
  customerName: string;
  items: string;
  amount: string;
  status: "Paid" | "Pending";
}

const activities: ActivityItem[] = [
  {
    date: "Oct 27, 2023",
    customerName: "Ali Hassan",
    items: "12W Bulb x 50",
    amount: "Rs. 12,500",
    status: "Paid",
  },
  {
    date: "Oct 27, 2023",
    customerName: "Karachi Electronics",
    items: "9W LED x 100",
    amount: "Rs. 8,200",
    status: "Paid",
  },
  {
    date: "Oct 26, 2023",
    customerName: "M. Usman Traders",
    items: "Flood Light x 5",
    amount: "Rs. 15,000",
    status: "Pending",
  },
  {
    date: "Oct 26, 2023",
    customerName: "Zeeshan Lights",
    items: "Strip Light x 20",
    amount: "Rs. 4,500",
    status: "Paid",
  },
  {
    date: "Oct 25, 2023",
    customerName: "Lahore Electric Store",
    items: "Mixed Package",
    amount: "Rs. 22,100",
    status: "Paid",
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-4 md:px-6 py-5 border-b border-border flex justify-between items-center">
        <h2 className="text-foreground text-lg md:text-xl font-bold">Recent Activity</h2>
        <button className="text-primary text-sm font-bold hover:underline">View All</button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Date</th>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Customer Name</th>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Items</th>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Amount</th>
              <th className="px-6 py-4 text-muted-foreground text-sm font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities.map((activity, index) => (
              <tr key={index} className="hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{activity.date}</td>
                <td className="px-6 py-4 text-sm font-bold">{activity.customerName}</td>
                <td className="px-6 py-4 text-sm">{activity.items}</td>
                <td className="px-6 py-4 text-sm font-bold text-primary">{activity.amount}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={activity.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {activities.map((activity, index) => (
          <div key={index} className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-foreground">{activity.customerName}</p>
                <p className="text-sm text-muted-foreground">{activity.date}</p>
              </div>
              <StatusBadge status={activity.status} />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{activity.items}</p>
              <p className="font-bold text-primary">{activity.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "Paid" | "Pending" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        status === "Paid"
          ? "bg-success-muted text-success"
          : "bg-warning-muted text-warning"
      )}
    >
      {status}
    </span>
  );
}
