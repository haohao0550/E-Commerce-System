import { Router } from 'express';
import healthRoutes from '@/modules/healths/index.js';
import authRoutes from '@/modules/auths/index.js';
import userRoutes from '@/modules/users/index.js';


const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
