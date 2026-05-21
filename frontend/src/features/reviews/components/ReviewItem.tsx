import React, { useState } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useReviewStore } from '@/features/reviews/stores/review.store';
import { ReviewStars } from './ReviewStars';
import type { Review } from '@/features/reviews/types/review';

export interface ReviewItemProps {
  review: Review;
  onEdit?: (review: Review) => void;
  canDelete?: boolean;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return date.toLocaleDateString();
};

export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onEdit,
  canDelete = false,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { deleteReview, deleteLoading } = useReviewStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnReview = user?.id === review.userId;
  const canEditOrDelete = isOwnReview || canDelete;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReview(review.id);
      showToast('Review deleted successfully', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete review';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border-b border-outline-variant/30 py-6 last:border-b-0">
      {/* Header with User Info */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-1 items-start gap-3">
          {review.user?.avatar && (
            <img
              src={review.user.avatar}
              alt={review.user.name || 'User'}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-on-surface">
              {review.user?.name || 'Anonymous User'}
            </p>
            <p className="text-xs text-on-surface-variant">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {canEditOrDelete && (
          <div className="flex gap-2">
            {isOwnReview && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review)}
                disabled={deleteLoading || isDeleting}
                className="rounded p-2 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
                aria-label="Edit review"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading || isDeleting}
              className="rounded p-2 text-error hover:bg-error/10 disabled:opacity-50"
              aria-label="Delete review"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-2">
        <ReviewStars value={review.rating} size="sm" editable={false} />
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="break-words text-sm text-on-surface">
          {review.comment}
        </p>
      )}
    </div>
  );
};
