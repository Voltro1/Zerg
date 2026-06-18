import { redirect } from "next/navigation";
import { AdminClient } from "@/components/admin/admin-client";
import { getCurrentUser } from "@/actions/auth";
import {
  getAdminStats,
  getAllUsers,
  getAllCreatorsAdmin,
  getAllProductsAdmin,
  getAllCommissionsAdmin,
} from "@/services/marketplace";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [stats, users, creators, products, commissions] = await Promise.all([
    getAdminStats(),
    getAllUsers(),
    getAllCreatorsAdmin(),
    getAllProductsAdmin(),
    getAllCommissionsAdmin(),
  ]);

  return (
    <AdminClient
      stats={stats}
      users={users}
      creators={creators}
      products={products}
      commissions={commissions}
    />
  );
}
