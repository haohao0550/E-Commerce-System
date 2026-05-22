import { Router } from 'express';
import { ReviewController } from './review.controller.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import {
    validateBody,
    validateParams,
    validateQuery,
} from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import {
    createReviewSchema,
    getAdminReviewsQuerySchema,
    getProductReviewsQuerySchema,
    productIdParamSchema,
    reviewIdParamSchema,
    updateReviewSchema,
} from './review.schema.js';
import { cacheMiddleware, clearCache } from '@/shared/middlewares/cache.middleware.js';

export const reviewRoutes = Router();
export const adminReviewRoutes = Router();
const cacheKeys = ['dashboardTopProducts', 'productReviewsByProductId'];

const reviewController = new ReviewController();

reviewRoutes.get(
    '/products/:productId/reviews',
    auditLog('review.getProductReviews'),
    validateParams(productIdParamSchema),
    validateQuery(getProductReviewsQuerySchema),
    cacheMiddleware((req) => `productReviewsByProductId:${req.params.productId}`, 60),
    asyncHandler(reviewController.getProductReviews.bind(reviewController)),
);

reviewRoutes.post(
    '/products/:productId/reviews',
    auditLog('review.createReview'),
    authenticate,
    requireRole('USER'),
    validateParams(productIdParamSchema),
    validateBody(createReviewSchema),
    clearCache(cacheKeys),
    asyncHandler(reviewController.createReview.bind(reviewController)),
);

reviewRoutes.patch(
    '/reviews/:id',
    auditLog('review.updateReview'),
    authenticate,
    requireRole('USER'),
    validateParams(reviewIdParamSchema),
    validateBody(updateReviewSchema),
    clearCache(cacheKeys),
    asyncHandler(reviewController.updateReview.bind(reviewController)),
);

reviewRoutes.delete(
    '/reviews/:id',
    auditLog('review.deleteReview'),
    authenticate,
    validateParams(reviewIdParamSchema),
    clearCache(cacheKeys),
    asyncHandler(reviewController.deleteReview.bind(reviewController)),
);

adminReviewRoutes.use(authenticate, requireRole('ADMIN'));

adminReviewRoutes.get(
    '/reviews',
    auditLog('admin.review.getAll'),
    validateQuery(getAdminReviewsQuerySchema),
    asyncHandler(reviewController.getAdminReviews.bind(reviewController)),
);
