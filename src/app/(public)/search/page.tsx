import { SearchPageClient } from "@/components/search/search-page-client";
import { globalSearch } from "@/services/marketplace";

export const metadata = { title: "Search" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const results = query ? await globalSearch(query) : { creators: [], products: [], categories: [] };

  return <SearchPageClient results={results} query={query} />;
}
