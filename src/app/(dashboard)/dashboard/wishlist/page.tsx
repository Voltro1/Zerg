import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/marketplace/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/actions/auth";
import { getWishlist } from "@/services/marketplace";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const products = await getWishlist(user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Wishlist</h1>
        <p className="mt-1 text-muted-foreground">Products you&apos;ve saved for later</p>
      </div>
      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} isFavorited />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Browse products and save your favorites."
          />
          <Link href="/products" className="mt-4 inline-block text-sm text-primary hover:underline">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
