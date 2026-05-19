import { Request, Response, NextFunction } from 'express';
import * as appError from '@/shared/errors/app.error.js';
import { ZodError } from 'zod';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    req.log?.error(
        { err },
        `${req.originalUrl} - ${err instanceof Error ? err.message : 'Unknown error'}`,
    );

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            error: {
                code: 'VALIDATION_ERROR',
                details: err.flatten().fieldErrors,
            },
        });
    }

    if (err instanceof appError.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                code: err.code,
                details: err.details || [],
            },
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra hệ thống',
        error: {
            code: 'INTERNAL_ERROR',
            details: [],
        },
    });
};
