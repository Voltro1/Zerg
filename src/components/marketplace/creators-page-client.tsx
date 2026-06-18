"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CreatorCard } from "@/components/marketplace/creator-card";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Creator, PaginatedResult } from "@/types";

export function CreatorsPageClient({
  initialData,
  categories,
  skills,
}: {
  initialData: PaginatedResult<Creator>;
  categories: string[];
  skills: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const skill = searchParams.get("skill") || "";
  const sort = searchParams.get("sort") || "";
  const page = Number(searchParams.get("page") || "1");
  const available = searchParams.get("available");
  const minRating = searchParams.get("minRating");

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      if (!updates.page) params.delete("page");
      router.push(`/creators?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Creators</h1>
        <p className="mt-2 text-muted-foreground">Find vetted creators for your next project.</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <SearchInput
          value={search}
          onChange={(v) => updateParams({ search: v })}
          placeholder="Search creators..."
          className="flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <Select value={category || "all"} onValueChange={(v) => updateParams({ category: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={skill || "all"} onValueChange={(v) => updateParams({ skill: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Skill" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {skills.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort || "default"} onValueChange={(v) => updateParams({ sort: v === "default" ? "" : v })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Featured</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="sales">Most Sales</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={available || "all"} onValueChange={(v) => updateParams({ available: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Availability" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Available</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.data.some((c) => c.featured) && (
        <div className="mb-8">
          <Badge variant="default" className="mb-4">Featured Creators</Badge>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
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
        <EmptyState
          icon={Users}
          title="No creators found"
          description="Try adjusting your filters or search terms."
        />
      )}
    </div>
  );
}
