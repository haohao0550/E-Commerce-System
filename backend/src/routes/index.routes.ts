import { Router } from 'express';
import healthRoutes from '@/modules/healths/index.js';
import authRoutes from '@/modules/auths/index.js';
import userRoutes from '@/modules/users/index.js';
import adminUserRoutes from '@/modules/users/index.js';
import addressRoutes from '@/modules/addresses/index.js';
import uploadRoutes from '@/modules/upload/index.js';
import categoryRoutes from '@/modules/categories/index.js';
import productRoutes from '@/modules/products/index.js';
import cartRoutes from '@/modules/carts/index.js';
import {
  productVariantsRoute,
  adminProductVariantsRoute
} from '@/modules/product-variant/index.js'

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/addresses', addressRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/carts', cartRoutes);
router.use(productVariantsRoute)
router.use('/admin', adminProductVariantsRoute)

export default router;
