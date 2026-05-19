import { Prisma } from '@/generated/prisma/client.js';
import prisma from '@/shared/configs/db.config.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/shared/errors/app.error.js';
import type { CreateReviewInput, GetAdminReviewsQuery, GetProductReviewsQuery, UpdateReviewInput } from './review.dto.js';
import { ReviewRepo } from './review.repo.js';
import type { ReviewWithUser, ReviewWithUserAndProduct } from './review.repo.interface.js';

export class ReviewService {
    private reviewRepo: ReviewRepo;

    constructor() {
        this.reviewRepo = new ReviewRepo();
    }

    private toPublicReview(review: ReviewWithUser) {
        return {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            userId: review.userId,
            productId: review.productId,
            orderId: review.orderId,
            user: review.user,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        };
    }

    private toAdminReview(review: ReviewWithUserAndProduct) {
        return {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            userId: review.userId,
            productId: review.productId,
            orderId: review.orderId,
            user: review.user,
            product: review.product,
            order: review.order,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        };
    }

    private async ensureProductExists(productId: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, isDeleted: true },
        });

        if (!product || product.isDeleted) {
            throw new NotFoundError('Product');
        }
    }

    async getProductReviews(productId: string, query: GetProductReviewsQuery) {
        await this.ensureProductExists(productId);

        const where: Prisma.ReviewWhereInput = {
            productId,
            ...(typeof query.rating === 'number' && { rating: query.rating }),
        };

        const skip = (query.page - 1) * query.limit;
        const [reviews, total] = await Promise.all([
            this.reviewRepo.findManyByProduct(where, skip, query.limit),
            this.reviewRepo.count(where),
        ]);

        return {
            reviews: reviews.map((review) => this.toPublicReview(review)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }

    async createReview(userId: string, productId: string, input: CreateReviewInput) {
        await this.ensureProductExists(productId);

        const order = await prisma.order.findFirst({
            where: {
                id: input.orderId,
                userId,
                status: 'DELIVERED',
            },
            include: {
                items: {
                    include: {
                        variant: {
                            select: {
                                productId: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new BadRequestError('Order must be DELIVERED to create a review');
        }

        const hasProduct = order.items.some((item) => item.variant?.productId === productId);
        if (!hasProduct) {
            throw new BadRequestError('Order does not contain this product');
        }

        const existedReview = await this.reviewRepo.findByUserAndProduct(userId, productId);
        if (existedReview) {
            throw new BadRequestError('Review already exists for this product');
        }

        try {
            const review = await this.reviewRepo.create({
                rating: input.rating ?? 5,
                comment: input.comment,
                user: {
                    connect: { id: userId },
                },
                product: {
                    connect: { id: productId },
                },
                order: {
                    connect: { id: input.orderId },
                },
            });

            return this.toPublicReview(review);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestError('Review already exists for this product');
            }

            throw error;
        }
    }

    async updateReview(userId: string, id: string, input: UpdateReviewInput) {
        const review = await this.reviewRepo.findById(id);
        if (!review) {
            throw new NotFoundError('Review');
        }

        if (review.userId !== userId) {
            throw new ForbiddenError('You do not have permission to update this review');
        }

        const updatedReview = await this.reviewRepo.update(id, input);
        return this.toPublicReview(updatedReview);
    }

    async deleteReview(id: string, userId: string, role: string) {
        const review = await this.reviewRepo.findById(id);
        if (!review) {
            throw new NotFoundError('Review');
        }

        if (role !== 'ADMIN' && review.userId !== userId) {
            throw new ForbiddenError('You do not have permission to delete this review');
        }

        await this.reviewRepo.delete(id);
    }

    async getAdminReviews(query: GetAdminReviewsQuery) {
        const where: Prisma.ReviewWhereInput = {
            ...(query.productId && { productId: query.productId }),
            ...(query.userId && { userId: query.userId }),
            ...(query.orderId && { orderId: query.orderId }),
            ...(typeof query.rating === 'number' && { rating: query.rating }),
            ...(query.search && {
                comment: {
                    contains: query.search,
                    mode: 'insensitive',
                },
            }),
        };

        const skip = (query.page - 1) * query.limit;
        const [reviews, total] = await Promise.all([
            this.reviewRepo.findManyAdmin(where, skip, query.limit),
            this.reviewRepo.count(where),
        ]);

        return {
            reviews: reviews.map((review) => this.toAdminReview(review)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }
}
