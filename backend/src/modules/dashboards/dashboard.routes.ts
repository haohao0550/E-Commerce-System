import { Router } from 'express';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import {
    validateBody,
    validateParams,
    validateQuery,
} from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import * as dashboardSchema from './dashboard.schema.js';
import { DashboardController } from './dashboard.controller.js';
import { cacheMiddleware } from '@/shared/middlewares/cache.middleware.js';

const router = Router();
const adminRouter = Router();
const dashboardController = new DashboardController();

router.get(
    '/dashboard/top-products',
    auditLog('View Top Products Dashboard'),
    validateQuery(dashboardSchema.TopProductsQuerySchema),
    cacheMiddleware('dashboardTopProducts', 60),
    asyncHandler(dashboardController.getTopProducts.bind(dashboardController)),
);

router.use('/admin/dashboard', authenticate, requireRole('ADMIN'), adminRouter);

adminRouter.get(
    '/revenue',
    auditLog('View Revenue Dashboard'),
    validateQuery(dashboardSchema.RevenueQuerySchema),
    asyncHandler(dashboardController.getRevenue.bind(dashboardController)),
);

adminRouter.get(
    '/order-count',
    auditLog('View Order Count Dashboard'),
    validateQuery(dashboardSchema.OrderCountQuerySchema),
    asyncHandler(dashboardController.getOrderCount.bind(dashboardController)),
);

export default router;
