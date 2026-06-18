import { notFound, redirect } from "next/navigation";
import { CommissionDetailClient } from "@/components/commissions/commission-detail-client";
import { getCommissionById } from "@/services/marketplace";
import { getCurrentUser } from "@/actions/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const commission = await getCommissionById(id);
  return { title: commission?.title || "Commission" };
}

export default async function CommissionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const commission = await getCommissionById(id);
  if (!commission) notFound();

  const isCreator = user.role === "creator" || user.role === "admin";

  return (
    <CommissionDetailClient
      commission={commission}
      currentUserId={user.id}
      isCreator={isCreator}
    />
  );
}
