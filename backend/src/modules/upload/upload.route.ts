import express from 'express'
import { upload } from '@/shared/middlewares/upload.middleware.js'
import { uploadController } from './upload.controller.js'
import { authenticate, requireRole } from '@/shared/middlewares/authenticate.middlware.js'

const router = express.Router()

router.post('/avatar',authenticate, upload.single('avatar'), uploadController.uploadImage)

router.post('/image', authenticate, requireRole('ADMIN'), upload.single('image'), uploadController.uploadImage)

router.post('/images', authenticate, requireRole('ADMIN'), upload.array('images', 3), uploadController.uploadImages)

export default router;
