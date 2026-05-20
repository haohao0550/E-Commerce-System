import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '@/shared/middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { authLimiter } from '@/shared/middlewares/rate-limit.middleware.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';

const router = Router();
const authController = new AuthController();

router.post(
    '/register',
    validateBody(registerSchema),
    auditLog('REGISTER'),
    asyncHandler(authController.register),
);

router.post(
    '/login',
    authLimiter,
    validateBody(loginSchema),
    auditLog('LOGIN'),
    asyncHandler(authController.login),
);

router.post('/refresh', authLimiter, asyncHandler(authController.refreshToken));

router.post(
    '/logout',
    authenticate,
    auditLog('LOGOUT'),
    asyncHandler(authController.logout),
);

export default router;
