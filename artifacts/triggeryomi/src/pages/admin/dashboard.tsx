import { useGetAdminStats, useGetMonthlySales } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="border border-border rounded-lg bg-card p-6 flex items-start gap-4">
      <div className="bg-primary/10 p-3 rounded-lg text-primary flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">{label}</p>
        <p className="text-2xl font-bold font-mono">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: monthlySales, isLoading: salesLoading } = useGetMonthlySales();

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">Command Dashboard</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">Real-time overview of TriggeryOmi operations.</p>

        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Revenue"
              value={`$${stats?.totalRevenue.toFixed(2) ?? "0.00"}`}
              icon={DollarSign}
            />
            <StatCard
              label="Total Orders"
              value={String(stats?.totalOrders ?? 0)}
              icon={ShoppingCart}
            />
            <StatCard
              label="Products Listed"
              value={String(stats?.totalProducts ?? 0)}
              icon={Package}
            />
            <StatCard
              label="Orders This Month"
              value={String(stats?.ordersThisMonth ?? 0)}
              icon={TrendingUp}
            />
            <StatCard
              label="Revenue This Month"
              value={`$${stats?.revenueThisMonth.toFixed(2) ?? "0.00"}`}
              icon={DollarSign}
            />
            <StatCard
              label="Top Product"
              value={stats?.topProduct ?? "—"}
              icon={Package}
              sub="Best seller by units"
            />
          </div>
        )}

        <div className="border border-border rounded-lg bg-card p-6">
          <h2 className="text-lg font-bold uppercase tracking-tighter mb-6">Monthly Sales</h2>
          {salesLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : monthlySales?.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-sm">
              No sales data yet. Place an order to see stats.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySales} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? `$${value.toFixed(2)}` : value,
                    name === "revenue" ? "Revenue" : "Orders"
                  ]}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="orders" />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
