import { Router } from 'express';
import { AddressController } from './address.controller.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { validateBody, validateParams, validateQuery } from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import * as addressSchema from './address.schema.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { cacheMiddleware } from '@/shared/middlewares/cache.middleware.js';

const router = Router();
const addressController = new AddressController();

router.get(
    '/', 
    auditLog('Get all addresses'),
    authenticate, 
    requireRole('USER'),
    validateQuery(addressSchema.getAddressListSchema), 
    cacheMiddleware('address:', 60),
    asyncHandler(addressController.getAllAddresses.bind(addressController))
);

router.post(
    '/', 
    auditLog('Create new address'),
    authenticate, 
    requireRole('USER'),
    validateBody(addressSchema.createAddressSchema), 
    asyncHandler(addressController.createAddress.bind(addressController))
);

router.get(
    '/default', 
    auditLog('Get default address'),
    authenticate,
    requireRole('USER'),
    asyncHandler(addressController.getDefaultAddress.bind(addressController))
);

router.get(
    '/:id',  
    auditLog('Get address by ID'),
    authenticate, 
    requireRole('USER'),
    validateParams(addressSchema.updateAddressParamsSchema), 
    asyncHandler(addressController.getAddressById.bind(addressController))
);

router.patch(
    '/:id', 
    auditLog('Update address by ID'),
    authenticate, 
    requireRole('USER'),
    validateParams(addressSchema.updateAddressParamsSchema), 
    validateBody(addressSchema.updateAddressSchema), 
    asyncHandler(addressController.updateAddress.bind(addressController))
);

router.patch(
    '/:id/default', 
    auditLog('Set default address by ID'),
    authenticate, 
    requireRole('USER'),
    validateParams(addressSchema.updateAddressParamsSchema), 
    validateBody(addressSchema.setDefaultAddressSchema),
    asyncHandler(addressController.updateAddress.bind(addressController))
);

router.delete(
    '/:id', 
    auditLog('Delete address by ID'),
    authenticate, 
    requireRole('USER'),
    validateParams(addressSchema.updateAddressParamsSchema), 
    asyncHandler(addressController.deleteAddress.bind(addressController))
);

export default router;