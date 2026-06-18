import { notFound } from "next/navigation";
import { CreatorProfileClient } from "@/components/marketplace/creator-profile-client";
import { getCreatorByUsername, getCreatorReviews, isCreatorSaved } from "@/services/marketplace";
import { getCurrentUser } from "@/actions/auth";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) return { title: "Creator Not Found" };
  return {
    title: `${creator.display_name} — Creator Profile`,
    description: creator.bio?.slice(0, 160) || `View ${creator.display_name}'s portfolio and products on Zerg.`,
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) notFound();

  const [reviews, user] = await Promise.all([
    getCreatorReviews(creator.id),
    getCurrentUser(),
  ]);

  const saved = user ? await isCreatorSaved(user.id, creator.id) : false;

  return (
    <CreatorProfileClient
      creator={creator}
      reviews={reviews}
      isSaved={saved}
      isAuthenticated={!!user}
    />
  );
}
