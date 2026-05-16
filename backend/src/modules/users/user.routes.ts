import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { validateBody } from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { changePasswordSchema, updateProfileSchema } from './user.schema.js';

const router = Router();
const userController = new UserController();

router.use(authenticate, requireRole('USER', 'ADMIN'));

router.get('/me', userController.getProfile);

router.patch(
    '/me',
    validateBody(updateProfileSchema),
    auditLog('UPDATE_PROFILE'),
    userController.updateProfile
);

router.patch(
    '/me/password',
    validateBody(changePasswordSchema),
    auditLog('CHANGE_PASSWORD'),
    userController.changePassword
);

router.delete(
    '/me',
    auditLog('DELETE_ACCOUNT'),
    userController.deleteAccount
);

export default router;
