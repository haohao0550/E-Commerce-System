import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';

export const auditLog = (action: string) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();

        res.on('finish', () => {
            if (res.statusCode < 400) {
                req.log?.info(
                    {
                        action,
                        userId: req.user?.userId,
                        ip: req.ip,
                        resource: res.locals.resource,
                        statusCode: res.statusCode,
                        duration: Date.now() - start,
                    },
                    req.originalUrl,
                );
            }
        });

        next();
    });
};
