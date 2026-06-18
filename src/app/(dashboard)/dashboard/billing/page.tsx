import { redirect } from "next/navigation";
import { BillingClient } from "@/components/dashboard/billing-client";
import { getCurrentUser } from "@/actions/auth";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <BillingClient isPremium={user.is_premium} />;
}
