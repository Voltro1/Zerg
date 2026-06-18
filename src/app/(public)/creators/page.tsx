import { CreatorsPageClient } from "@/components/marketplace/creators-page-client";
import { getCreators, getCreatorCategories, getCreatorSkills } from "@/services/marketplace";

export const metadata = { title: "Creators" };

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    skill?: string;
    sort?: string;
    available?: string;
    minRating?: string;
  }>;
}

export default async function CreatorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [data, categories, skills] = await Promise.all([
    getCreators({
      page: Number(params.page) || 1,
      search: params.search,
      category: params.category,
      skill: params.skill,
      sort: params.sort,
      available: params.available === "true" ? true : undefined,
      minRating: params.minRating ? Number(params.minRating) : undefined,
    }),
    getCreatorCategories(),
    getCreatorSkills(),
  ]);

  return <CreatorsPageClient initialData={data} categories={categories} skills={skills} />;
}
