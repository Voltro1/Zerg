"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export function ProductCard({ product, onFavorite, isFavorited }: ProductCardProps) {
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop";

  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/30 hover:shadow-[0_0_30px_rgba(255,221,51,0.08)]">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          {product.featured && (
            <Badge className="absolute left-3 top-3" variant="default">Featured</Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold leading-tight transition-colors group-hover:text-primary">
              {product.title}
            </h3>
          </Link>
          {onFavorite && (
            <button
              type="button"
              onClick={() => onFavorite(product.id)}
              className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
              aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`size-4 ${isFavorited ? "fill-primary text-primary" : ""}`} />
            </button>
          )}
        </div>
        {product.creator && (
          <Link href={`/creator/${product.creator.username}`} className="text-xs text-muted-foreground hover:text-primary">
            {product.creator.display_name}
          </Link>
        )}
        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={product.rating} size="sm" showValue />
          <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <ShoppingBag className="size-3" />
          {product.sales_count} sales
        </div>
      </CardContent>
    </Card>
  );
}
