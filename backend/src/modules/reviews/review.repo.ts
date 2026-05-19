import prisma from '@/shared/configs/db.config.js';
import type { Prisma, Review } from '@/generated/prisma/client.js';
import type {
    IReviewRepo,
    ReviewWithUser,
    ReviewWithUserAndProduct,
} from './review.repo.interface.js';

export class ReviewRepo implements IReviewRepo {
    async count(where: Prisma.ReviewWhereInput): Promise<number> {
        return prisma.review.count({ where });
    }

    async findManyByProduct(
        where: Prisma.ReviewWhereInput,
        skip: number,
        take: number,
    ): Promise<ReviewWithUser[]> {
        return prisma.review.findMany({
            where,
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async findManyAdmin(
        where: Prisma.ReviewWhereInput,
        skip: number,
        take: number,
    ): Promise<ReviewWithUserAndProduct[]> {
        return prisma.review.findMany({
            where,
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                order: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    async findById(id: string): Promise<Review | null> {
        return prisma.review.findUnique({
            where: { id },
        });
    }

    async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
        return prisma.review.findFirst({
            where: {
                userId,
                productId,
            },
        });
    }

    async create(data: Prisma.ReviewCreateInput): Promise<ReviewWithUser> {
        return prisma.review.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async update(id: string, data: Prisma.ReviewUpdateInput): Promise<ReviewWithUser> {
        return prisma.review.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.review.delete({
            where: { id },
        });
    }
}
