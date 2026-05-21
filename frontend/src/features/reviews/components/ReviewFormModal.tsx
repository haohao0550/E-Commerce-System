import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useReviewStore } from '@/features/reviews/stores/review.store';
import { useToast } from '@/context/ToastContext';
import { ReviewStars } from './ReviewStars';
import type { Review, CreateReviewPayload, UpdateReviewPayload } from '@/features/reviews/types/review';

export interface ReviewFormModalProps {
  open: boolean;
  productId: string;
  orderId: string;
  productName?: string;
  productImage?: string;
  initialReview?: Review | null;
  onClose: () => void;
  onSuccess?: (review: Review) => void;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  open,
  productId,
  orderId,
  productName = 'Product',
  productImage,
  initialReview = null,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { createReview, updateReview, createLoading, updateLoading } = useReviewStore();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing review data
  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setComment(initialReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
  }, [initialReview, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (rating < 1 || rating > 5) {
      showToast('Please select a rating between 1 and 5', 'error');
      return;
    }

    const trimmedComment = comment.trim();

    try {
      setIsSubmitting(true);
      let review: Review;

      if (initialReview) {
        // Update mode
        const payload: UpdateReviewPayload = {
          rating,
          ...(trimmedComment && { comment: trimmedComment }),
        };
        review = await updateReview(initialReview.id, payload);
        showToast('Review updated successfully', 'success');
      } else {
        // Create mode
        const payload: CreateReviewPayload = {
          orderId,
          rating,
          ...(trimmedComment && { comment: trimmedComment }),
        };
        review = await createReview(productId, payload);
        showToast('Review created successfully', 'success');
      }

      onSuccess?.(review);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit review';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = createLoading || updateLoading || isSubmitting;
  const isEditMode = !!initialReview;
  const modalTitle = isEditMode ? 'Edit Review' : 'Review This Product';
  const submitButtonText = isEditMode ? 'Update Review' : 'Submit Review';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg md:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-on-surface">{modalTitle}</h2>
        </div>

        {/* Product Info */}
        <div className="mb-6 flex gap-4 rounded-lg bg-surface-container-low p-4">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <p className="text-xs font-medium text-on-surface-variant">Product</p>
            <p className="text-sm font-semibold text-on-surface">{productName}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Section */}
          <div>
            <label className="mb-2 block text-sm font-medium text-on-surface">
              Rating <span className="text-error">*</span>
            </label>
            <ReviewStars
              value={rating}
              size="lg"
              editable={!isLoading}
              onChange={setRating}
              className="justify-start"
            />
          </div>

          {/* Comment Section */}
          <div>
            <label htmlFor="comment" className="mb-2 block text-sm font-medium text-on-surface">
              Your Review <span className="text-on-surface-variant">(Optional)</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
              placeholder="Share your experience with this product..."
              maxLength={500}
              className="min-h-32 w-full resize-none rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-on-surface-variant">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Submitting...' : submitButtonText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
