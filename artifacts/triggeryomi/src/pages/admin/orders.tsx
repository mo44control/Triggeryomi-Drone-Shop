import { useListAdminOrders } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/admin-layout";

export function AdminOrders() {
  const { data: orders, isLoading } = useListAdminOrders();

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-tighter mb-1">Orders</h1>
          <p className="text-muted-foreground font-mono text-sm">{orders?.length ?? 0} total orders</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Items</th>
                  <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="text-center px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-mono font-bold text-xs">#{order.id}</p>
                        <p className="text-muted-foreground text-xs mt-1 md:hidden">{order.customerName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-muted-foreground text-xs font-mono">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-xs text-muted-foreground font-mono">
                            {item.productName} x{item.quantity}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-muted-foreground font-mono">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-mono font-bold">${order.totalAmount.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge
                        variant="outline"
                        className="border-green-500/50 text-green-400 font-mono text-xs uppercase"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right text-muted-foreground font-mono text-xs hidden sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {orders?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-mono text-sm">
                      No orders yet. Orders will appear here after customers checkout.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
