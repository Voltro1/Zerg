"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Clock,
  Heart,
  Briefcase,
  CheckCircle,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { ProductCard } from "@/components/marketplace/product-card";
import { CommissionFormDialog } from "@/components/commissions/commission-form-dialog";
import { formatCurrency, getInitials } from "@/lib/utils";
import { toggleSavedCreatorAction } from "@/actions/social";
import type { Creator, Review, Product } from "@/types";

interface CreatorProfileClientProps {
  creator: Creator;
  reviews: Review[];
  isSaved: boolean;
  isAuthenticated: boolean;
}

export function CreatorProfileClient({
  creator,
  reviews,
  isSaved: initialSaved,
  isAuthenticated,
}: CreatorProfileClientProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [commissionOpen, setCommissionOpen] = useState(false);

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow creators");
      return;
    }
    const result = await toggleSavedCreatorAction(creator.id);
    if (result.success && result.data) {
      setSaved(result.data.saved);
      toast.success(result.data.saved ? "Creator saved!" : "Creator removed");
    } else if (!result.success) {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <div className="relative h-48 md:h-64 bg-secondary">
        {creator.banner_url && (
          <Image src={creator.banner_url} alt="" fill className="object-cover opacity-70" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative -mt-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="size-24 border-4 border-background">
              <AvatarImage src={creator.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">{getInitials(creator.display_name)}</AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold md:text-3xl">{creator.display_name}</h1>
                {creator.verified && <BadgeCheck className="size-5 text-primary" />}
                {creator.featured && <Badge>Featured</Badge>}
              </div>
              <p className="text-muted-foreground">@{creator.username}</p>
            </div>
          </div>
          <div className="flex gap-2 pb-2">
            <Button variant="outline" onClick={handleSave}>
              <Heart className={`size-4 ${saved ? "fill-primary text-primary" : ""}`} />
              {saved ? "Following" : "Follow"}
            </Button>
            <Button onClick={() => isAuthenticated ? setCommissionOpen(true) : toast.error("Please sign in")}>
              <Briefcase className="size-4" /> Commission
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Rating", value: creator.rating.toFixed(1), icon: StarRating },
            { label: "Completed", value: creator.completed_commissions, icon: CheckCircle },
            { label: "Response", value: creator.response_time, icon: Clock },
            { label: "From", value: formatCurrency(creator.price_from), icon: Briefcase },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {creator.bio && <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">{creator.bio}</p>}

        {creator.creator_skills && creator.creator_skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {creator.creator_skills.map((s) => (
              <Badge key={s.id} variant="secondary">{s.skill}</Badge>
            ))}
          </div>
        )}

        <Tabs defaultValue="portfolio" className="mt-10">
          <TabsList>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="mt-6">
            {creator.creator_portfolios && creator.creator_portfolios.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {creator.creator_portfolios.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative aspect-[4/3]">
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="33vw" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No portfolio items yet.</p>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            {creator.products && creator.products.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {creator.products.map((p) => <ProductCard key={p.id} product={p as Product} />)}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No products listed yet.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(review.reviewer?.full_name || "U")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.reviewer?.full_name}</p>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                      </div>
                      {review.comment && <p className="mt-3 text-sm">{review.comment}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No reviews yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CommissionFormDialog
        open={commissionOpen}
        onOpenChange={setCommissionOpen}
        creatorId={creator.id}
        creatorName={creator.display_name}
      />
    </div>
  );
}
