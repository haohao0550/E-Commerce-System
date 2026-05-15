import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/logging/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    req.log = logger.child({ reqId: req.id });
    next();
};
