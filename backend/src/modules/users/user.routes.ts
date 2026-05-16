import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { validateBody } from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { changePasswordSchema, updateProfileSchema } from './user.schema.js';

const router = Router();
const userController = new UserController();

router.use(authenticate, requireRole('USER', 'ADMIN'));

router.get('/me', asyncHandler(userController.getProfile));

router.patch(
    '/me',
    validateBody(updateProfileSchema),
    auditLog('UPDATE_PROFILE'),
    asyncHandler(userController.updateProfile)
);

router.patch(
    '/me/password',
    validateBody(changePasswordSchema),
    auditLog('CHANGE_PASSWORD'),
    asyncHandler(userController.changePassword)
);

router.patch(
    '/me/change-password',
    validateBody(changePasswordSchema),
    auditLog('CHANGE_PASSWORD'),
    asyncHandler(userController.changePassword)
);

router.delete(
    '/me',
    auditLog('DELETE_ACCOUNT'),
    asyncHandler(userController.deleteAccount)
);

export default router;
