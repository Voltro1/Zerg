"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Creator } from "@/types";

interface CreatorCardProps {
  creator: Creator;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link href={`/creator/${creator.username}`}>
      <Card className="group overflow-hidden transition-all hover:border-primary/30 hover:shadow-[0_0_30px_rgba(255,221,51,0.08)]">
        <div className="relative h-24 overflow-hidden bg-secondary">
          {creator.banner_url && (
            <Image
              src={creator.banner_url}
              alt=""
              fill
              className="object-cover opacity-60"
              sizes="300px"
            />
          )}
          <div className="absolute -bottom-6 left-4">
            <Avatar className="size-12 border-2 border-card">
              <AvatarImage src={creator.avatar_url || undefined} alt={creator.display_name} />
              <AvatarFallback>{getInitials(creator.display_name)}</AvatarFallback>
            </Avatar>
          </div>
          {creator.featured && (
            <Badge className="absolute right-3 top-3" variant="default">Featured</Badge>
          )}
        </div>
        <CardContent className="pt-8 pb-4 px-4">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold transition-colors group-hover:text-primary">
              {creator.display_name}
            </h3>
            {creator.verified && <BadgeCheck className="size-4 text-primary" />}
          </div>
          <p className="text-xs text-muted-foreground">@{creator.username}</p>
          {creator.category && (
            <Badge variant="secondary" className="mt-2">{creator.category}</Badge>
          )}
          <div className="mt-3 flex items-center justify-between">
            <StarRating rating={creator.rating} size="sm" showValue />
            <span className="text-sm font-medium text-primary">
              from {formatCurrency(creator.price_from)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {creator.response_time}
            {!creator.available && (
              <Badge variant="outline" className="ml-auto text-xs">Busy</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
