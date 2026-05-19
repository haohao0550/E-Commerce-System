// Libs
import cloudinary from '@/shared/configs/claudinary.config.js';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { filesEndpoint } from '@/utils/file.util.js';
import { Request, Response } from 'express';
import fs from 'fs/promises';

class UploadController {
    private readonly uploadFolder = 'shoes-item';
    private readonly maxSize = 1024 * 1024; // 1MB

    private async removeLocalFile(path: string) {
        try {
            await fs.unlink(path);
        } catch {
            // Ignore error when file does not exist
        }
    }

    private validateFile(file: Express.Multer.File) {
        if (!filesEndpoint.includes(file.mimetype)) {
            return 'Invalid file format. Only images are allowed.';
        }

        if (file.size > this.maxSize) {
            return 'The file size is too large. Please select a file smaller than 1MB';
        }

        return null;
    }

    private async uploadToCloudinary(file: Express.Multer.File) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: this.uploadFolder,
            });

            return result.secure_url;
        } finally {
            await this.removeLocalFile(file.path);
        }
    }

    uploadImage = asyncHandler(async (req: Request, res: Response) => {
        const file = req.file as Express.Multer.File | undefined;

        if (!file) {
            res.status(400).json({
                message: 'No file uploaded',
            });
            return;
        }

        const errorMessage = this.validateFile(file);

        if (errorMessage) {
            await this.removeLocalFile(file.path);

            res.status(400).json({
                message: errorMessage,
            });
            return;
        }

        const imageUrl = await this.uploadToCloudinary(file);

        res.status(200).json({
            status: 'success',
            message: 'Uploaded successfully',
            data: {
                image: imageUrl,
            },
        });
    });

    uploadImages = asyncHandler(async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[] | undefined;

        if (!files || files.length === 0) {
            res.status(400).json({
                message: 'No files uploaded',
            });
            return;
        }

        const errors: string[] = [];

        for (const file of files) {
            const errorMessage = this.validateFile(file);

            if (errorMessage) {
                errors.push(`${file.originalname}: ${errorMessage}`);
            }
        }

        if (errors.length > 0) {
            await Promise.all(files.map((file) => this.removeLocalFile(file.path)));

            res.status(400).json({
                message: 'Upload validation failed',
                errors,
            });
            return;
        }

        const uploadedUrls = await Promise.all(files.map((file) => this.uploadToCloudinary(file)));

        res.status(200).json({
            status: 'success',
            message: 'Uploaded successfully',
            data: {
                images: uploadedUrls,
            },
        });
    });
}

export const uploadController = new UploadController();
