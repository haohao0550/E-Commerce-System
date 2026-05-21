import React from 'react';
import { ReviewStars } from './ReviewStars';
import type { Review } from '@/features/reviews/types/review';

export interface ReviewSummaryProps {
  reviews: Review[];
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return null;
  }

  // Calculate average rating
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  // Calculate rating distribution
  const ratingCounts = Array.from({ length: 5 }).map((_, i) => {
    const rating = 5 - i;
    return {
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
      percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
    };
  });

  return (
    <div className="rounded-lg bg-surface-container-low p-6">
      {/* Average Rating */}
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl font-bold text-on-surface">
          {averageRating.toFixed(1)}
        </div>
        <ReviewStars value={Math.round(averageRating)} size="md" editable={false} className="justify-center" />
        <p className="mt-2 text-sm text-on-surface-variant">
          Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {ratingCounts.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3">
            <button
              type="button"
              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              {rating} star
            </button>
            <div className="flex-1 h-2 bg-outline-variant/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-on-surface-variant min-w-8">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
