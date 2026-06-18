"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/shared/search-input";
import { CreatorCard } from "@/components/marketplace/creator-card";
import { ProductCard } from "@/components/marketplace/product-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Search } from "lucide-react";
import type { SearchResult } from "@/types";

export function SearchPageClient({ results, query }: { results: SearchResult; query: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const hasResults =
    results.creators.length > 0 ||
    results.products.length > 0 ||
    results.categories.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-display text-3xl font-bold">Search</h1>
      <SearchInput
        value={query}
        onChange={updateSearch}
        placeholder="Search creators, products, categories..."
        className="mb-8 max-w-xl"
      />

      {!query ? (
        <p className="text-muted-foreground">Enter a search term to find creators, products, and categories.</p>
      ) : !hasResults ? (
        <EmptyState icon={Search} title="No results found" description={`No results for "${query}"`} />
      ) : (
        <div className="space-y-10">
          {results.creators.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">Creators</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.creators.map((c) => <CreatorCard key={c.id} creator={c} />)}
              </div>
            </section>
          )}
          {results.products.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">Products</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
          {results.categories.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <Link key={c.id} href={`/products?category=${c.slug}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">
                      {c.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
