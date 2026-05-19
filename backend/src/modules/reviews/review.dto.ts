export interface CreateReviewInput {
    rating?: number;
    comment?: string;
    orderId: string;
}

export interface UpdateReviewInput {
    rating?: number;
    comment?: string;
}

export interface GetProductReviewsQuery {
    page: number;
    limit: number;
    rating?: number;
}

export interface GetAdminReviewsQuery {
    page: number;
    limit: number;
    rating?: number;
    productId?: string;
    userId?: string;
    orderId?: string;
    search?: string;
}
