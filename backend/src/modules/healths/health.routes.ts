import { Router } from 'express';
import { HealthController } from './health.controller.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';

const router = Router();

router.get('/', auditLog('Health Check'), asyncHandler(HealthController.healthCheck));

export default router;
