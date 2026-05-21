export type ReviewUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export type ReviewProduct = {
  id: string;
  name: string;
  slug?: string;
  images?: string[];
};

export type ReviewOrder = {
  id: string;
  status: string;
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  productId: string;
  orderId: string;
  user?: ReviewUser;
  product?: ReviewProduct;
  order?: ReviewOrder;
  createdAt: string;
  updatedAt: string;
};

export type ReviewPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetProductReviewsParams = {
  page?: number;
  limit?: number;
  rating?: number;
};

export type GetProductReviewsResponse = {
  reviews: Review[];
  pagination: ReviewPagination;
};

export type CreateReviewPayload = {
  orderId: string;
  rating: number;
  comment?: string;
};

export type UpdateReviewPayload = {
  rating?: number;
  comment?: string;
};

export type GetAdminReviewsParams = {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
  orderId?: string;
  rating?: number;
  search?: string;
};

export type GetAdminReviewsResponse = {
  reviews: Review[];
  pagination: ReviewPagination;
};
