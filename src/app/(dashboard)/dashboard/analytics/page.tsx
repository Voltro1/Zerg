import { redirect } from "next/navigation";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";
import { getCurrentUser } from "@/actions/auth";
import { getAnalytics, getCreatorDashboardStats } from "@/services/marketplace";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "client") redirect("/dashboard");

  const [data, stats] = await Promise.all([
    getAnalytics(user.id),
    getCreatorDashboardStats(user.id),
  ]);

  return <AnalyticsClient data={data} stats={stats} isPremium={user.is_premium} />;
}
