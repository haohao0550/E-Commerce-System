import { Router } from 'express';
import { CouponController } from './coupon.controller.js';
import { validateBody, validateQuery } from '@/shared/middlewares/validate.middleware.js';
import { authenticate } from '@/shared/middlewares/authenticate.middlware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { getCouponsQuerySchema, validateCouponSchema } from './coupon.schema.js';
import { cacheMiddleware } from '@/shared/middlewares/cache.middleware.js';

const router = Router();
const couponController = new CouponController();

router.get(
    '/',
    validateQuery(getCouponsQuerySchema),
    cacheMiddleware('coupon', 60),
    asyncHandler(couponController.getCoupons),
);

router.post(
    '/validate',
    auditLog('VALIDATE_COUPON'),
    authenticate,
    validateBody(validateCouponSchema),
    asyncHandler(couponController.validateCoupon),
);

export default router;
