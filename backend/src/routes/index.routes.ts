import { Router } from 'express';
import healthRoutes from '@/modules/healths/index.js';
import authRoutes from '@/modules/auths/index.js';
import userRoutes, { adminUserRoutes } from '@/modules/users/index.js';
import addressRoutes from '@/modules/addresses/index.js';
import uploadRoutes from '@/modules/upload/upload.route.js';
import categoryRoutes from '@/modules/categories/categories.route.js';
import productRoutes from '@/modules/products/products.route.js';
import { orderRoutes, adminOrderRoutes } from '@/modules/orders/index.js';
import cartRoutes from '@/modules/carts/index.js';
import {
    productVariantsRoute,
    adminProductVariantsRoute,
} from '@/modules/product-variant/index.js';
import { couponRoutes, adminCouponRoutes } from '@/modules/coupons/index.js';
import { reviewRoutes, adminReviewRoutes } from '@/modules/reviews/index.js';
import { paymentMoMoRouter } from '@/modules/payment/index.js';
import dashboardRoutes from '@/modules/dashboards/index.js';
import { paymentStripeRouter } from '@/modules/payment-stripe/payment-stripe.route.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/addresses', addressRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/carts', cartRoutes);
router.use(productVariantsRoute);
router.use('/admin', adminProductVariantsRoute);
router.use('/coupons', couponRoutes);
router.use('/admin/coupons', adminCouponRoutes);
router.use(reviewRoutes);
router.use('/admin', adminReviewRoutes);
router.use('/payment/momo', paymentMoMoRouter);
router.use('/payment/stripe', paymentStripeRouter);
router.use(dashboardRoutes);

export default router;
