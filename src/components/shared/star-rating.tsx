import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizes = { sm: "size-3", md: "size-4", lg: "size-5" };

export function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue,
  interactive,
  onChange,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role={interactive ? "radiogroup" : "img"} aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;

        if (!interactive) {
          return (
            <span key={i} aria-hidden="true">
              <Star
                className={cn(
                  sizes[size],
                  filled || half ? "fill-primary text-primary" : "text-muted-foreground/40"
                )}
              />
            </span>
          );
        }

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(interactive && "cursor-pointer hover:scale-110 transition-transform")}
            aria-label={`${i + 1} star${i + 1 > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizes[size],
                filled || half ? "fill-primary text-primary" : "text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
      {showValue && <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>}
    </div>
  );
}
