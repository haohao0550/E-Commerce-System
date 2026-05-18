import { Router } from 'express';
import { CouponController } from './coupon.controller.js';
import { validateBody } from '@/shared/middlewares/validate.middleware.js';
import { authenticate } from '@/shared/middlewares/authenticate.middlware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { validateCouponSchema } from './coupon.schema.js';

const router = Router();
const couponController = new CouponController();

router.post(
    '/validate',
    authenticate,
    validateBody(validateCouponSchema),
    auditLog('VALIDATE_COUPON'),
    asyncHandler(couponController.validateCoupon),
);

export default router;
