import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service.js';

export class ReviewController {
    private reviewService: ReviewService;

    constructor() {
        this.reviewService = new ReviewService();
    }

    async getProductReviews(req: Request, res: Response, next: NextFunction) {
        const { productId } = req.params as { productId: string };

        const result = await this.reviewService.getProductReviews(productId, req.validatedQuery);

        res.status(200).json({
            success: true,
            message: 'Get product reviews successful',
            data: result,
        });
    }

    async createReview(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.user;
        const { productId } = req.params as { productId: string };

        const review = await this.reviewService.createReview(userId, productId, req.body);

        res.status(201).json({
            success: true,
            message: 'Create review successful',
            data: review,
        });
    }

    async updateReview(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.user;
        const { id } = req.params as { id: string };

        const review = await this.reviewService.updateReview(userId, id, req.body);

        res.status(200).json({
            success: true,
            message: 'Update review successful',
            data: review,
        });
    }

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        const { userId, role } = req.user;
        const { id } = req.params as { id: string };

        await this.reviewService.deleteReview(id, userId, role);

        res.status(200).json({
            success: true,
            message: 'Delete review successful',
            data: {},
        });
    }

    async getAdminReviews(req: Request, res: Response, next: NextFunction) {
        const result = await this.reviewService.getAdminReviews(req.validatedQuery);

        res.status(200).json({
            success: true,
            message: 'Get reviews successful',
            data: result,
        });
    }
}
