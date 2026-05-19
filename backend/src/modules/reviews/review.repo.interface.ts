import { Prisma, Review } from '@/generated/prisma/client.js';

export type ReviewWithUser = Prisma.ReviewGetPayload<{
    include: {
        user: {
            select: {
                id: true;
                name: true;
                avatar: true;
            };
        };
    };
}>;

export type ReviewWithUserAndProduct = Prisma.ReviewGetPayload<{
    include: {
        user: {
            select: {
                id: true;
                name: true;
                avatar: true;
            };
        };
        product: {
            select: {
                id: true;
                name: true;
                slug: true;
            };
        };
        order: {
            select: {
                id: true;
                status: true;
                createdAt: true;
            };
        };
    };
}>;

export interface IReviewRepo {
    count(where: Prisma.ReviewWhereInput): Promise<number>;
    findManyByProduct(
        where: Prisma.ReviewWhereInput,
        skip: number,
        take: number,
    ): Promise<ReviewWithUser[]>;
    findManyAdmin(
        where: Prisma.ReviewWhereInput,
        skip: number,
        take: number,
    ): Promise<ReviewWithUserAndProduct[]>;
    findById(id: string): Promise<Review | null>;
    findByUserAndProduct(userId: string, productId: string): Promise<Review | null>;
    create(data: Prisma.ReviewCreateInput): Promise<ReviewWithUser>;
    update(id: string, data: Prisma.ReviewUpdateInput): Promise<ReviewWithUser>;
    delete(id: string): Promise<void>;
}
