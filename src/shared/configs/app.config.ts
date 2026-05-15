import dotenv from 'dotenv';
import zod from 'zod';

dotenv.config();

const envSchema = zod.object({
    PORT: zod.string().default('3000'),

    SUPABASE_URL: zod.string(),
    DATABASE_URL: zod.string(),
    DIRECT_URL: zod.string().optional(),

    ACCESS_TOKEN_SECRET: zod.string(),
    REFRESH_TOKEN_SECRET: zod.string(),
    EXPIRE_ACCESS_TOKEN: zod.string(),
    EXPIRE_REFRESH_TOKEN: zod.string(),

    REDIS: zod.string(),
    
    CLOUDINARY_NAME: zod.string(),
    CLOUDINARY_API_KEY: zod.string(),
    CLOUDINARY_API_SECRET: zod.string(),
});

export const appConfig = envSchema.safeParse(process.env);