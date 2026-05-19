import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { Request, Response, NextFunction } from 'express';
import { redis } from '@/shared/cache/redis.js';

const response = (data: any, ttlSecs: number, cacheHit: boolean) => {
    return {
        ...data,
        cacheAt: new Date(new Date().getTime() + ttlSecs * 1000).toISOString(),
        cacheHit,
    };
};

const parseCachedPayload = (cached: unknown) => {
    if (typeof cached === 'string') {
        try {
            return JSON.parse(cached);
        } catch {
            return cached;
        }
    }
    return cached;
};

export const cacheMiddleware = (keyPrefix: string, ttlSecs: number) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const cacheKey = `${keyPrefix}:${req.method}:${req.originalUrl}:${req.user?.userId ?? 'anon'}`;
        const cached = await redis.get(cacheKey);
        
        if (cached !== null && cached !== undefined) {
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).json(response(parseCachedPayload(cached), ttlSecs, true));
        }

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', `private, max-age=${ttlSecs}, no-store`);

        const origJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                void redis.set(cacheKey, body, { ex: ttlSecs });
            }
            return origJson(response(body, ttlSecs, false));
        };
        next();
    });
};
