import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@/shared/errors/app.error.js';
import prisma from '@/shared/configs/db.config.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new AppError('No token provided', 401, 'NO_TOKEN');
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as {
            userId: string;
            role: string;
            jti: string;
        };

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
        });

        if (!user) {
            throw new AppError('User not found', 401, 'USER_NOT_FOUND');
        }

        if (user.isDeleted) {
            throw new AppError('User account has been deleted', 401, 'USER_DELETED');
        }

        const refreshToken = await prisma.refreshToken.findUnique({
            where: { jti: decoded.jti },
        });

        if (!refreshToken || refreshToken.revoked) {
            throw new AppError('Phiên làm việc đã hết hạn hoặc bị thu hồi', 401, 'SESSION_REVOKED');
        }

        req.user = decoded;

        return next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
        }
        return next(error);
    }
};

export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role!)) {
            return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
        }
        return next();
    };
};
