import React, { useEffect, useState } from 'react';
import { Loader2, Star, PenLine, ChevronLeft, ChevronRight, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviewStore } from '@/features/reviews/stores/review.store';
import { ReviewFormModal } from './ReviewFormModal';
import type { Review } from '@/features/reviews/types/review';

export interface ReviewSectionProps {
  productId: string;
  productName?: string;
  productImage?: string;
}

// ─── Star renderer ────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        style={{ width: size, height: size }}
        className={star <= rating ? 'fill-black text-black' : 'fill-none text-black/20'}
      />
    ))}
  </div>
);

// ─── Rating bar row ───────────────────────────────────────────────────────────
const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-[10px] font-black font-mono text-black w-2 shrink-0">{star}</span>
      <div className="flex-1 h-1.5 bg-black/8 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: star * 0.08, ease: 'easeOut' }}
          className="h-full bg-black rounded-full"
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-black/40 w-7 text-right shrink-0">
        {count}
      </span>
    </div>
  );
};

// ─── Single review card ───────────────────────────────────────────────────────
const ReviewCard = ({
  review,
  index,
  onEdit,
}: {
  review: Review;
  index: number;
  onEdit?: (r: Review) => void;
}) => {
  const initials = review.user?.name
    ? review.user.name.slice(0, 2).toUpperCase()
    : 'AN';

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group relative bg-white border border-black/8 rounded-2xl p-6 hover:border-black/20 hover:shadow-sm transition-all duration-300"
    >
      {/* Verified badge */}
      <div className="absolute top-5 right-5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
        <Check className="w-2.5 h-2.5" />
        <span>Verified</span>
      </div>

      {/* Author row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center text-xs font-black font-mono shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-black truncate">
            {review.user?.name || 'Anonymous'}
          </p>
          <p className="text-[10px] font-mono text-black/40 mt-0.5">{formattedDate}</p>
        </div>
      </div>

      {/* Stars */}
      <div className="mb-3">
        <StarRating rating={review.rating} size={13} />
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-xs text-black/60 font-medium leading-relaxed line-clamp-4">
          {review.comment}
        </p>
      )}

      {/* Edit button — only shown for own reviews */}
      {onEdit && (
        <button
          onClick={() => onEdit(review)}
          className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors"
        >
          <PenLine className="w-3 h-3" />
          <span>Edit</span>
        </button>
      )}
    </motion.div>
  );
};

// ─── Main ReviewSection ───────────────────────────────────────────────────────
export const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  productName = 'Product',
  productImage,
}) => {
  const { productReviews, pagination, productReviewsLoading, fetchProductReviews } =
    useReviewStore();

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void fetchProductReviews(productId, { page: currentPage, limit: 6 });
  }, [productId, fetchProductReviews, currentPage]);

  const handleOpenForm = () => {
    setEditingReview(null);
    setIsFormModalOpen(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setEditingReview(null);
    setIsFormModalOpen(false);
    void fetchProductReviews(productId, { page: currentPage, limit: 6 });
  };

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalReviews = productReviews.length;
  const avgRating =
    totalReviews > 0
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: productReviews.filter((r) => r.rating === star).length,
  }));

  const hasReviews = totalReviews > 0;

  return (
    <section className="w-full">
      {/* ── Section header ────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30">
            Community
          </span>
          <h2 className="text-4xl font-display font-black uppercase tracking-tight text-black mt-1 leading-none">
            Reviews
          </h2>
        </div>

        {/* Write a review CTA */}
        <button
          onClick={handleOpenForm}
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black/85 transition-all shadow-md active:scale-95"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {productReviewsLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-black/30" />
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {!productReviewsLoading && (
        <AnimatePresence mode="wait">
          {hasReviews ? (
            <motion.div
              key="reviews"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              {/* ── Left: Summary panel ──────────────────────────────────── */}
              <aside className="lg:col-span-3">
                <div className="sticky top-24 space-y-6">
                  {/* Big rating number */}
                  <div className="bg-black text-white rounded-2xl p-7 text-center">
                    <p className="text-6xl font-black font-mono leading-none">
                      {avgRating.toFixed(1)}
                    </p>
                    <div className="flex justify-center mt-3">
                      <StarRating rating={Math.round(avgRating)} size={15} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-2">
                      {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                    </p>
                  </div>

                  {/* Rating breakdown */}
                  <div className="bg-white border border-black/8 rounded-2xl p-5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4">
                      Breakdown
                    </p>
                    {ratingCounts.map(({ star, count }) => (
                      <RatingBar key={star} star={star} count={count} total={totalReviews} />
                    ))}
                  </div>
                </div>
              </aside>

              {/* ── Right: Review cards grid ─────────────────────────────── */}
              <div className="lg:col-span-9 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productReviews.map((review, i) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      index={i}
                      onEdit={handleEditReview}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-black/8">
                    <p className="text-[10px] font-mono font-bold text-black/30 uppercase tracking-widest">
                      Page {pagination.page} / {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="w-9 h-9 border border-black/10 rounded-xl flex items-center justify-center text-black/40 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={currentPage >= (pagination.totalPages ?? 1)}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="w-9 h-9 border border-black/10 rounded-xl flex items-center justify-center text-black/40 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ── Empty state ──────────────────────────────────────────────── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-black/10 rounded-2xl gap-4"
            >
              <div className="w-14 h-14 bg-black/4 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-black/20" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-black">
                  No Reviews Yet
                </p>
                <p className="text-[11px] text-black/40 font-medium mt-1 max-w-xs">
                  Reviews appear after delivered orders are rated. Be the first to share your experience.
                </p>
              </div>
              <button
                onClick={handleOpenForm}
                className="inline-flex items-center gap-2 mt-2 bg-black text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black/85 transition-all active:scale-95"
              >
                <PenLine className="w-3 h-3" />
                <span>Write First Review</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Review Form Modal */}
      {isFormModalOpen && (
        <ReviewFormModal
          open={isFormModalOpen}
          productId={productId}
          orderId={''}
          productName={productName}
          productImage={productImage}
          initialReview={editingReview ?? null}
          onSuccess={handleFormSuccess}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}
    </section>
  );
};