import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '@/shared/middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { authLimiter } from '@/shared/middlewares/rate-limit.middleware.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';

const router = Router();
const authController = new AuthController();

router.post(
    '/register',
    validateBody(registerSchema),
    auditLog('REGISTER'),
    authController.register
);

router.post(
    '/login',
    authLimiter,
    validateBody(loginSchema),
    auditLog('LOGIN'),
    authController.login
);

router.post(
    '/refresh',
    authLimiter,
    authController.refreshToken
);

router.post(
    '/logout',
    authenticate,
    requireRole('USER', 'ADMIN'),
    auditLog('LOGOUT'),
    authController.logout
);

export default router;
