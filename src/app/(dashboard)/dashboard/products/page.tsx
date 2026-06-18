import { redirect } from "next/navigation";
import { ProductsManageClient } from "@/components/dashboard/products-manage-client";
import { getCurrentUser, getCurrentCreator } from "@/actions/auth";
import { getCreatorProducts, getCategories } from "@/services/marketplace";

export const metadata = { title: "My Products" };

export default async function ProductsManagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "client") redirect("/dashboard");

  const creator = await getCurrentCreator();
  if (!creator) redirect("/dashboard/settings");

  const [products, categories] = await Promise.all([
    getCreatorProducts(creator.id),
    getCategories(),
  ]);

  return <ProductsManageClient products={products} categories={categories} />;
}
