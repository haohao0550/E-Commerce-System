import { Router } from 'express';
import healthRoutes from '@/modules/healths/index.js';
import authRoutes from '@/modules/auths/auth.route.js';


const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

export default router;
