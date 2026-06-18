import Link from "next/link";
import {
  ShoppingBag,
  Briefcase,
  Heart,
  Bell,
  DollarSign,
  TrendingUp,
  Star,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreatorCard } from "@/components/marketplace/creator-card";
import { ProductCard } from "@/components/marketplace/product-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/actions/auth";
import {
  getClientDashboardStats,
  getCreatorDashboardStats,
  getRecentOrders,
  getCommissions,
  getSavedCreators,
  getNotifications,
} from "@/services/marketplace";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isCreator = user.role === "creator" || user.role === "admin";

  const [stats, orders, commissions, savedCreators, notifications] = await Promise.all([
    isCreator ? getCreatorDashboardStats(user.id) : getClientDashboardStats(user.id),
    getRecentOrders(user.id),
    getCommissions(user.id, user.role),
    getSavedCreators(user.id),
    getNotifications(user.id),
  ]);

  const recentCommissions = commissions.slice(0, 5);
  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Welcome back, {user.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isCreator ? "Here's how your creator business is performing." : "Here's an overview of your activity."}
        </p>
        {user.is_premium && <Badge className="mt-2">Premium</Badge>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isCreator ? (
          <>
            <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.totalRevenue || 0)} />
            <StatCard icon={ShoppingBag} label="Total Sales" value={String(stats.totalSales || 0)} />
            <StatCard icon={Briefcase} label="Commissions" value={String(stats.totalCommissions || 0)} />
            <StatCard icon={Star} label="Avg Rating" value={(stats.averageRating || 0).toFixed(1)} />
          </>
        ) : (
          <>
            <StatCard icon={ShoppingBag} label="Orders" value={String(stats.totalOrders || 0)} />
            <StatCard icon={Briefcase} label="Commissions" value={String(stats.totalCommissions || 0)} />
            <StatCard icon={DollarSign} label="Total Spent" value={formatCurrency(stats.totalSpent || 0)} />
            <StatCard icon={Heart} label="Saved Creators" value={String(stats.savedCreators || 0)} />
          </>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent {isCreator ? "Commissions" : "Orders"}</CardTitle>
            <Link href={isCreator ? "/dashboard/commissions" : "/dashboard/orders"}>
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isCreator ? (
              recentCommissions.length > 0 ? (
                <div className="space-y-3">
                  {recentCommissions.map((c) => (
                    <Link key={c.id} href={`/dashboard/commissions/${c.id}`} className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:border-primary/30">
                      <div>
                        <p className="text-sm font-medium">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(c.budget)}</p>
                      </div>
                      <Badge variant="outline">{c.status.replace("_", " ")}</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No commissions yet.</p>
              )
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{o.product?.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">{formatCurrency(o.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No orders yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Notifications</CardTitle>
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {unreadNotifications.length > 0 ? (
              <div className="space-y-3">
                {unreadNotifications.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">All caught up!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!isCreator && savedCreators.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Saved Creators</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedCreators.slice(0, 3).map((c) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
