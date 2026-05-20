import { beforeAll, afterAll } from 'vitest';
import prisma from './helper/db.config.js';

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});
