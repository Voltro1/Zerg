"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, ShoppingCart, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/shared/star-rating";
import { ProductCard } from "@/components/marketplace/product-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { purchaseProductAction, toggleFavoriteAction } from "@/actions/products";
import type { Product } from "@/types";

interface ProductDetailClientProps {
  product: Product;
  related: Product[];
  isFavorited: boolean;
  isAuthenticated: boolean;
}

export function ProductDetailClient({
  product,
  related,
  isFavorited: initialFavorited,
  isAuthenticated,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [purchasing, setPurchasing] = useState(false);

  const images = product.images?.length
    ? product.images
    : ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"];

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to purchase");
      return;
    }
    setPurchasing(true);
    const result = await purchaseProductAction(product.id);
    setPurchasing(false);
    if (result.success) {
      toast.success("Purchase successful!");
    } else {
      toast.error(result.error);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save to wishlist");
      return;
    }
    const result = await toggleFavoriteAction(product.id);
    if (result.success && result.data) {
      setFavorited(result.data.favorited);
      toast.success(result.data.favorited ? "Added to wishlist" : "Removed from wishlist");
    } else if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.description,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Link href="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
            <Image src={images[selectedImage]} alt={product.title} fill className="object-cover" priority sizes="50vw" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative size-16 overflow-hidden rounded-lg border-2 ${selectedImage === i ? "border-primary" : "border-border"}`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.product_categories && (
            <Badge variant="secondary" className="mb-3">{product.product_categories.name}</Badge>
          )}
          <h1 className="font-display text-3xl font-bold">{product.title}</h1>
          <div className="mt-3 flex items-center gap-4">
            <StarRating rating={product.rating} showValue />
            <span className="text-sm text-muted-foreground">{product.review_count} reviews</span>
            <span className="text-sm text-muted-foreground">{product.sales_count} sales</span>
          </div>

          {product.creator && (
            <Link href={`/creator/${product.creator.username}`} className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/30">
              <Avatar>
                <AvatarImage src={product.creator.avatar_url || undefined} />
                <AvatarFallback>{getInitials(product.creator.display_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{product.creator.display_name}</p>
                <p className="text-xs text-muted-foreground">@{product.creator.username}</p>
              </div>
            </Link>
          )}

          <p className="mt-6 text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

          {product.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handlePurchase}
              loading={purchasing}
            >
              <ShoppingCart className="size-4" />
              Purchase
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleFavorite}
              aria-label="Add to wishlist"
            >
              <Heart
                className={`size-4 ${
                  favorited ? "fill-primary text-primary" : ""
                }`}
              />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleShare}
              aria-label="Share product"
            >
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 font-display text-2xl font-bold">Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 font-display text-2xl font-bold">Related Products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
