"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "@/components/marketplace/product-card";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";
import type { Product, PaginatedResult, ProductCategory } from "@/types";

export function ProductsPageClient({
  initialData,
  categories,
}: {
  initialData: PaginatedResult<Product>;
  categories: ProductCategory[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const page = Number(searchParams.get("page") || "1");

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      if (!updates.page) params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <p className="mt-2 text-muted-foreground">Digital assets to accelerate your e-commerce store.</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <SearchInput
          value={search}
          onChange={(v) => updateParams({ search: v })}
          placeholder="Search products..."
          className="flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <Select value={category || "all"} onValueChange={(v) => updateParams({ category: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort || "default"} onValueChange={(v) => updateParams({ sort: v === "default" ? "" : v })}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={(p) => updateParams({ page: String(p) })}
            className="mt-8"
          />
        </>
      ) : (
        <EmptyState icon={Package} title="No products found" description="Try adjusting your filters." />
      )}
    </div>
  );
}
