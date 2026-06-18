import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/marketplace/product-detail-client";
import { getProductBySlug, getRelatedProducts, isFavorited } from "@/services/marketplace";
import { getCurrentUser } from "@/actions/auth";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: { title: product.title, description: product.description.slice(0, 160) },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, user] = await Promise.all([
    getRelatedProducts(product.id, product.category_id),
    getCurrentUser(),
  ]);

  const favorited = user ? await isFavorited(user.id, product.id) : false;

  return (
    <ProductDetailClient
      product={product}
      related={related}
      isFavorited={favorited}
      isAuthenticated={!!user}
    />
  );
}
