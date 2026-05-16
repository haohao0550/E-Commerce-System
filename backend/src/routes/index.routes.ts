import { Router } from 'express';
import healthRoutes from '@/modules/healths/index.js';
import authRoutes from '@/modules/auths/index.js';
import userRoutes from '@/modules/users/index.js';
import adminUserRoutes from '@/modules/users/index.js';
import uploadRoutes from '@/modules/upload/upload.route.js';
import categoryRoutes from '@/modules/categories/categories.route.js';


const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);

export default router;
