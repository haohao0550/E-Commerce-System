import { Redis } from '@upstash/redis';
import { appConfig } from '@/shared/configs/app.config.js';

export const redis = new Redis({
    url: appConfig.UPSTASH_REDIS_REST_URL,
    token: appConfig.UPSTASH_REDIS_REST_TOKEN,
});
