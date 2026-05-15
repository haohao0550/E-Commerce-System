import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { memGet, memSet } from '../cache/memCache.js';
import { Request, Response, NextFunction } from 'express';

const statsResponse = (data: any, ttlSecs: number, cacheHit: boolean) => {
    return {
        ...data,
        cacheAt: new Date(new Date().getTime() + ttlSecs * 1000).toISOString(),
        cacheHit,
    };
};

export const cacheTodoStats = (key: string, ttlSecs: number) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const cached = memGet(key);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).json(statsResponse(cached, ttlSecs, true));
        }

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', `public, max-age=${ttlSecs}`);

        const origJson = res.json.bind(res);
        res.json = (body) => {
            memSet(key, body, ttlSecs * 1000);
            return origJson(statsResponse(body, ttlSecs, false));
        };
        next();
    });
};
