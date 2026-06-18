import { redirect } from "next/navigation";
import { PortfolioClient } from "@/components/dashboard/portfolio-client";
import { getCurrentUser, getCurrentCreator } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "client") redirect("/dashboard");

  const creator = await getCurrentCreator();
  if (!creator) redirect("/dashboard/settings");

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("creator_portfolios")
    .select("*")
    .eq("creator_id", creator.id)
    .order("sort_order");

  return <PortfolioClient items={items || []} />;
}
