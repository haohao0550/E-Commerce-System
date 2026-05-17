import { Router } from 'express';
import { AddressController } from './address.controller.js';
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js';
import { validateBody, validateParams, validateQuery } from '@/shared/middlewares/validate.middleware.js';
import { auditLog } from '@/shared/middlewares/audit-log.middleware.js';
import * as addressSchema from './address.schema.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';

const router = Router();
const addressController = new AddressController();

router.get(
    '/', 
    auditLog('Get all addresses'),
    authenticate, 
    validateQuery(addressSchema.getAddressListSchema), 
    asyncHandler(addressController.getAllAddresses.bind(addressController))
);

router.post(
    '/', 
    auditLog('Create new address'),
    authenticate, 
    validateBody(addressSchema.createAddressSchema), 
    asyncHandler(addressController.createAddress.bind(addressController))
);

router.get(
    '/:id',  
    auditLog('Get address by ID'),
    authenticate, 
    validateParams(addressSchema.updateAddressParamsSchema), 
    asyncHandler(addressController.getAddressById.bind(addressController))
);

router.patch(
    '/:id', 
    auditLog('Update address by ID'),
    authenticate, 
    validateParams(addressSchema.updateAddressParamsSchema), 
    validateBody(addressSchema.updateAddressSchema), 
    asyncHandler(addressController.updateAddress.bind(addressController))
);

router.patch(
    '/:id/default', 
    auditLog('Set default address by ID'),
    authenticate, 
    validateParams(addressSchema.updateAddressParamsSchema), 
    validateBody(addressSchema.setDefaultAddressSchema),
    asyncHandler(addressController.updateAddress.bind(addressController))
);

router.delete(
    '/:id', 
    auditLog('Delete address by ID'),
    authenticate, 
    validateParams(addressSchema.updateAddressParamsSchema), 
    asyncHandler(addressController.deleteAddress.bind(addressController))
);

export default router;