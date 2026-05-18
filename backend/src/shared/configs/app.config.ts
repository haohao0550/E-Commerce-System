import dotenv from 'dotenv';
import zod from 'zod';

dotenv.config();


const requiredString = zod.string().trim().min(1, 'This env is required')

const envSchema = zod.object({
    PORT: zod.string().default('3000'),
    NODE_ENV: zod.string().default('development'),
    LOG_LEVEL: zod.string().default('info'),
    
    DIRECT_URL: zod.string().optional(),

    ACCESS_TOKEN_SECRET: requiredString,
    REFRESH_TOKEN_SECRET: requiredString,
    EXPIRE_ACCESS_TOKEN: zod.string().default('15m'),
    EXPIRE_REFRESH_TOKEN: zod.string().default('7d'),

    REDIS: requiredString,
    
    CLOUDINARY_NAME: requiredString,
    CLOUDINARY_API_KEY: requiredString,
    CLOUDINARY_API_SECRET: requiredString,
});

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables:')
  console.error(parsedEnv.error.flatten().fieldErrors)
  process.exit(1)
}

export const appConfig = parsedEnv.data