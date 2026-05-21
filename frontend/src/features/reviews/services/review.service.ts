import { apiClient } from '@/services/api-client';
import type {
  Review,
  GetProductReviewsParams,
  GetProductReviewsResponse,
  CreateReviewPayload,
  UpdateReviewPayload,
  GetAdminReviewsParams,
  GetAdminReviewsResponse,
} from '@/features/reviews/types/review';

const buildQuery = (params: Record<string, unknown> = {}): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const reviewService = {
  async getProductReviews(
    productId: string,
    params?: GetProductReviewsParams
  ): Promise<GetProductReviewsResponse> {
    const query = buildQuery(params);
    const response = await apiClient<GetProductReviewsResponse>(
      `/products/${productId}/reviews${query}`,
      {
        method: 'GET',
        auth: false,
      }
    );
    return response.data;
  },

  async createReview(
    productId: string,
    payload: CreateReviewPayload
  ): Promise<Review> {
    const response = await apiClient<Review>(
      `/products/${productId}/reviews`,
      {
        method: 'POST',
        body: payload,
        auth: true,
      }
    );
    return response.data;
  },

  async updateReview(
    reviewId: string,
    payload: UpdateReviewPayload
  ): Promise<Review> {
    const response = await apiClient<Review>(
      `/reviews/${reviewId}`,
      {
        method: 'PATCH',
        body: payload,
        auth: true,
      }
    );
    return response.data;
  },

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient<void>(
      `/reviews/${reviewId}`,
      {
        method: 'DELETE',
        auth: true,
      }
    );
  },

  async getAdminReviews(
    params?: GetAdminReviewsParams
  ): Promise<GetAdminReviewsResponse> {
    const query = buildQuery(params);
    const response = await apiClient<GetAdminReviewsResponse>(
      `/admin/reviews${query}`,
      {
        method: 'GET',
        auth: true,
      }
    );
    return response.data;
  },
};
