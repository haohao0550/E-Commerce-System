import React from 'react';
import { ReviewItem } from './ReviewItem';
import type { Review } from '@/features/reviews/types/review';

export interface ReviewListProps {
  reviews: Review[];
  onEditReview?: (review: Review) => void;
  showDeleteButton?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onEditReview,
  showDeleteButton = false,
}) => {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          onEdit={onEditReview}
          canDelete={showDeleteButton}
        />
      ))}
    </div>
  );
};
