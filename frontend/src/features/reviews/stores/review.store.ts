import { create } from 'zustand';
import { reviewService } from '@/features/reviews/services/review.service';
import { getApiErrorMessage } from '@/utils/api-error';
import type {
  Review,
  ReviewPagination,
  GetProductReviewsParams,
  CreateReviewPayload,
  UpdateReviewPayload,
  GetAdminReviewsParams,
} from '@/features/reviews/types/review';

interface ReviewStore {
  // State
  productReviews: Review[];
  adminReviews: Review[];
  pagination: ReviewPagination | null;
  adminPagination: ReviewPagination | null;

  // Loading states
  loading: boolean;
  productReviewsLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  adminLoading: boolean;

  // Error state
  error: string | null;

  // Actions - Fetch
  fetchProductReviews: (productId: string, params?: GetProductReviewsParams) => Promise<void>;
  fetchAdminReviews: (params?: GetAdminReviewsParams) => Promise<void>;

  // Actions - Create/Update/Delete
  createReview: (productId: string, payload: CreateReviewPayload) => Promise<Review>;
  updateReview: (reviewId: string, payload: UpdateReviewPayload) => Promise<Review>;
  deleteReview: (reviewId: string) => Promise<void>;

  // Helper Actions
  clearError: () => void;
  resetProductReviews: () => void;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  // Initial State
  productReviews: [],
  adminReviews: [],
  pagination: null,
  adminPagination: null,
  loading: false,
  productReviewsLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  adminLoading: false,
  error: null,

  // Fetch Product Reviews
  fetchProductReviews: async (productId: string, params?: GetProductReviewsParams) => {
    set({ productReviewsLoading: true, error: null });
    try {
      const response = await reviewService.getProductReviews(productId, params);
      set({
        productReviews: response.reviews,
        pagination: response.pagination,
        productReviewsLoading: false,
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, productReviewsLoading: false });
      throw error;
    }
  },

  // Create Review
  createReview: async (productId: string, payload: CreateReviewPayload) => {
    set({ createLoading: true, error: null });
    try {
      const review = await reviewService.createReview(productId, payload);
      set((state) => ({
        productReviews: [review, ...state.productReviews],
        pagination: state.pagination
          ? { ...state.pagination, total: state.pagination.total + 1 }
          : null,
        createLoading: false,
      }));
      return review;
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, createLoading: false });
      throw error;
    }
  },

  // Update Review
  updateReview: async (reviewId: string, payload: UpdateReviewPayload) => {
    set({ updateLoading: true, error: null });
    try {
      const review = await reviewService.updateReview(reviewId, payload);
      set((state) => ({
        productReviews: state.productReviews.map((r) => (r.id === reviewId ? review : r)),
        adminReviews: state.adminReviews.map((r) => (r.id === reviewId ? review : r)),
        updateLoading: false,
      }));
      return review;
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, updateLoading: false });
      throw error;
    }
  },

  // Delete Review
  deleteReview: async (reviewId: string) => {
    set({ deleteLoading: true, error: null });
    try {
      await reviewService.deleteReview(reviewId);
      set((state) => {
        const updatedProductReviews = state.productReviews.filter((r) => r.id !== reviewId);
        const updatedAdminReviews = state.adminReviews.filter((r) => r.id !== reviewId);
        return {
          productReviews: updatedProductReviews,
          adminReviews: updatedAdminReviews,
          pagination: state.pagination
            ? {
                ...state.pagination,
                total: Math.max(0, state.pagination.total - 1),
              }
            : null,
          adminPagination: state.adminPagination
            ? {
                ...state.adminPagination,
                total: Math.max(0, state.adminPagination.total - 1),
              }
            : null,
          deleteLoading: false,
        };
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, deleteLoading: false });
      throw error;
    }
  },

  // Fetch Admin Reviews
  fetchAdminReviews: async (params?: GetAdminReviewsParams) => {
    set({ adminLoading: true, error: null });
    try {
      const response = await reviewService.getAdminReviews(params);
      set({
        adminReviews: response.reviews,
        adminPagination: response.pagination,
        adminLoading: false,
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      set({ error: message, adminLoading: false });
      throw error;
    }
  },

  // Helper Actions
  clearError: () => set({ error: null }),
  resetProductReviews: () => set({ productReviews: [], pagination: null }),
}));
