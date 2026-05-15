import { Request, Response, NextFunction } from 'express';
import * as appError from '@/shared/errors/app.error.js';

export const validateBody = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next(new appError.ValidationError(result.error.flatten()));
        }
        req.body = result.data;
        next();
    };
};

export const validateParams = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            return next(new appError.ValidationError(result.error.flatten()));
        }
        req.params = result.data;
        next();
    };
};

export const validateQuery = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            return next(new appError.ValidationError(result.error.flatten()));
        }
        req.validatedQuery = result.data;
        next();
    };
};

export const validateCookies = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.cookies);
        if (!result.success) {
            return next(new appError.ValidationError(result.error.flatten()));
        }
        req.cookies = result.data;
        next();
    };
};
