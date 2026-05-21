import { Router } from 'express';
import { CouponController } from './coupon.controller.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { validateBody, validateParams } from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { couponIdParamSchema, createCouponSchema, updateCouponSchema } from './coupon.schema.js';
import { clearCache } from '@/shared/middlewares/cache.middleware.js';

const router = Router();
const couponController = new CouponController();

router.use(authenticate, requireRole('ADMIN'));

router.post(
    '/',
    auditLog('ADMIN_CREATE_COUPON'),
    validateBody(createCouponSchema),
    clearCache(['coupon']),
    asyncHandler(couponController.createCoupon),
);

router.patch(
    '/:id',
    auditLog('ADMIN_UPDATE_COUPON'),
    validateParams(couponIdParamSchema),
    validateBody(updateCouponSchema),
    clearCache(['coupon']),
    asyncHandler(couponController.updateCoupon),
);

router.delete(
    '/:id',
    auditLog('ADMIN_DELETE_COUPON'),
    validateParams(couponIdParamSchema),
    auditLog('ADMIN_DELETE_COUPON'),
    clearCache(['coupon']),
    asyncHandler(couponController.deleteCoupon),
);

export default router;
