import { Router } from 'express';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { validateBody, validateParams, validateQuery } from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { CartController } from './cart.controller.js';
import * as cartSchema from './cart.schema.js';

const router = Router();
const cartController = new CartController();

router.get(
    '/', 
    auditLog('Get cart'),
    authenticate, 
    requireRole('user'), 
    validateQuery(cartSchema.getCartsQuerySchema), 
    asyncHandler(cartController.getCarts.bind(cartController)),
);

router.get(
    '/count',
    auditLog('Get cart count'),
    authenticate,
    requireRole('user'),
    asyncHandler(cartController.getCartCount.bind(cartController)),
);

router.post(
    '/',
    auditLog('Add to cart'),
    authenticate,
    requireRole('user'),
    validateBody(cartSchema.addToCartSchema),
    asyncHandler(cartController.addToCart.bind(cartController)),
);

router.post(
    '/sync',
    auditLog('Sync cart'),
    authenticate,
    requireRole('user'),
    validateBody(cartSchema.syncCartSchema),
    asyncHandler(cartController.syncCart.bind(cartController)),
);

router.post(
    '/validate',
    auditLog('Validate cart'),
    authenticate,
    requireRole('user'),
    validateBody(cartSchema.validateCartSchema),
    asyncHandler(cartController.validateCart.bind(cartController)),
);

router.post(
    '/apply-coupon',
    auditLog('Apply cart coupon'),
    authenticate,
    requireRole('user'),
    validateBody(cartSchema.applyCouponSchema),
    asyncHandler(cartController.applyCoupon.bind(cartController)),
);

router.delete(
    '/coupon',
    auditLog('Remove cart coupon'),
    authenticate,
    requireRole('user'),
    asyncHandler(cartController.removeCoupon.bind(cartController)),
);

router.patch(
    '/items/:variantId',
    auditLog('Update cart item by variant'),
    authenticate,
    requireRole('user'),
    validateParams(cartSchema.variantIdParamsSchema),
    validateBody(cartSchema.updateCartItemSchema),
    asyncHandler(cartController.updateCartItemByVariant.bind(cartController)),
);

router.delete(
    '/items/:variantId',
    auditLog('Delete cart item by variant'),
    authenticate,
    requireRole('user'),
    validateParams(cartSchema.variantIdParamsSchema),
    asyncHandler(cartController.deleteCartItemByVariant.bind(cartController)),
);

router.delete(
    '/',
    auditLog('Clear cart'),
    authenticate,
    requireRole('user'),
    asyncHandler(cartController.clearCart.bind(cartController)),
);

router.patch(
    '/:id',
    auditLog('Update cart item by id'),
    authenticate,
    requireRole('user'),
    validateParams(cartSchema.cartIdParamsSchema),
    validateBody(cartSchema.updateCartItemSchema),
    asyncHandler(cartController.updateCartItem.bind(cartController)),
);

router.delete(
    '/:id',
    auditLog('Delete cart item by id'),
    authenticate,
    requireRole('user'),
    validateParams(cartSchema.cartIdParamsSchema),
    asyncHandler(cartController.deleteCartItem.bind(cartController)),
);

export default router;