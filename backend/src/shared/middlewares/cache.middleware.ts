import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import type { Request, Response, NextFunction } from 'express';
import { redis } from '@/shared/cache/redis.js';

type CacheKeyBuilder = string | ((req: Request) => string);

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

const getCacheKey = (keyPrefix: CacheKeyBuilder, req: Request) => {
    return typeof keyPrefix === 'function' ? keyPrefix(req) : keyPrefix;
};

export const cacheMiddleware = (keyPrefix: CacheKeyBuilder, ttlSecs: number) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const cacheKey = getCacheKey(keyPrefix, req);
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

export const clearCache = (keyPrefixes: string[]) => {
    return async (_req: Request, _res: Response, next: NextFunction) => {
        try {
            // Simply delete each key prefix directly
            // Upstash Redis doesn't handle wildcard patterns efficiently
            await Promise.all(keyPrefixes.map((key) => redis.del(key)));
            return next();
        } catch (error) {
            // Log but don't fail the request if cache clearing fails
            console.error('Cache clearing error:', error);
            return next();
        }
    };
};
