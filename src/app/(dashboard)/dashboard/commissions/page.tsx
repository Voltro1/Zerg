import { redirect } from "next/navigation";
import { CommissionKanban } from "@/components/commissions/commission-kanban";
import { getCurrentUser } from "@/actions/auth";
import { getCommissions } from "@/services/marketplace";

export const metadata = { title: "Commissions" };

export default async function CommissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const commissions = await getCommissions(user.id, user.role);
  const isCreator = user.role === "creator" || user.role === "admin";

  return <CommissionKanban commissions={commissions} isCreator={isCreator} />;
}
