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
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Validation Error',
            errors: err.flatten().fieldErrors,
            reqId: req.id,
        });
    }

    if (err instanceof appError.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
            reqId: req.id,
        });
    }

    return res.status(500).json({
        success: false,
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
        reqId: req.id,
    });
};
