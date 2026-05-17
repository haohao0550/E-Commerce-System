import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { validateBody, validateParams, validateQuery } from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { getUsersQuerySchema, updateUserRoleSchema, userIdParamSchema } from './user.schema.js';

const router = Router();
const userController = new UserController();

router.use(authenticate, requireRole('ADMIN'));

router.get(
    '/',
    validateQuery(getUsersQuerySchema),
    asyncHandler(userController.getUsers)
);

router.get(
    '/:id',
    validateParams(userIdParamSchema),
    asyncHandler(userController.getUserById)
);

router.patch(
    '/:id/role',
    validateParams(userIdParamSchema),
    validateBody(updateUserRoleSchema),
    auditLog('ADMIN_UPDATE_USER_ROLE'),
    asyncHandler(userController.updateUserRole)
);

router.delete(
    '/:id',
    validateParams(userIdParamSchema),
    auditLog('ADMIN_DELETE_USER'),
    asyncHandler(userController.deleteUserByAdmin)
);

router.patch(
    '/:id/restore',
    validateParams(userIdParamSchema),
    auditLog('ADMIN_RESTORE_USER'),
    asyncHandler(userController.restoreUserByAdmin)
);

export default router;
