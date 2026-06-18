import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/actions/auth";
import { getRecentOrders } from "@/services/marketplace";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export const metadata = { title: "Order History" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await getRecentOrders(user.id, 50);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Order History</h1>
        <p className="mt-1 text-muted-foreground">Your purchase history</p>
      </div>
      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{order.product?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    by {order.creator?.display_name} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(order.amount)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Your purchases will appear here." />
      )}
    </div>
  );
}
