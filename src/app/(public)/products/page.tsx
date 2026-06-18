import { ProductsPageClient } from "@/components/marketplace/products-page-client";
import { getProducts, getCategories } from "@/services/marketplace";

export const metadata = { title: "Products" };

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [data, categories] = await Promise.all([
    getProducts({
      page: Number(params.page) || 1,
      search: params.search,
      category: params.category,
      sort: params.sort,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      minRating: params.minRating ? Number(params.minRating) : undefined,
    }),
    getCategories(),
  ]);

  return <ProductsPageClient initialData={data} categories={categories} />;
}
