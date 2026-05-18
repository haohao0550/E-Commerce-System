import { Router } from 'express';
import { CouponController } from './coupon.controller.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { validateBody, validateParams, validateQuery } from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import {
    couponIdParamSchema,
    createCouponSchema,
    getCouponsQuerySchema,
    updateCouponSchema,
} from './coupon.schema.js';

const router = Router();
const couponController = new CouponController();

router.use(authenticate, requireRole('ADMIN'));

router.get(
    '/',
    validateQuery(getCouponsQuerySchema),
    asyncHandler(couponController.getCoupons),
);

router.post(
    '/',
    validateBody(createCouponSchema),
    auditLog('ADMIN_CREATE_COUPON'),
    asyncHandler(couponController.createCoupon),
);

router.patch(
    '/:id',
    validateParams(couponIdParamSchema),
    validateBody(updateCouponSchema),
    auditLog('ADMIN_UPDATE_COUPON'),
    asyncHandler(couponController.updateCoupon),
);

router.delete(
    '/:id',
    validateParams(couponIdParamSchema),
    auditLog('ADMIN_DELETE_COUPON'),
    asyncHandler(couponController.deleteCoupon),
);

export default router;
