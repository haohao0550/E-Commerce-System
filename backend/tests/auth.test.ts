import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import * as helper from './helper/user.js';

describe('POST /api/v1/auth/register', async () => {
    beforeEach(async () => {
        await helper.clearUsers();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('201 + returns user when valid', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: '123456',
        });
        console.log(res.body);
        expect(res.status).toBe(201);
        expect(res.body.data.user.email).toBe('test@example.com');
        expect(res.body.data.user.id).toBeDefined();
    });

    it('400 if email is missing', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            password: '123456',
        });
        expect(res.status).toBe(400);
    });

    it('400 if password is missing', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
        });
        expect(res.status).toBe(400);
    });

    it('400 if password too short', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: '123',
        });
        expect(res.status).toBe(400);
    });
});

describe('POST /api/v1/auth/login', async () => {
    beforeEach(async () => {
        await helper.clearUsers();
        await helper.seedUser('test@example.com', '123456');
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('200 + returns token when valid', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'test@example.com',
            password: '123456',
        });
        expect(res.status).toBe(200);
    });

    it('400 if email is missing', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: '',
            password: '123456',
        });
        expect(res.status).toBe(400);
    });

    it('400 if password is missing', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'test@example.com',
        });
        expect(res.status).toBe(400);
    });

    it('401 if email not found', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'nonexistent@example.com',
            password: '123456',
        });
        expect(res.status).toBe(401);
    });

    it('401 if password incorrect', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'test@example.com',
            password: 'wrongpassword',
        });
        expect(res.status).toBe(401);
    });

    it('401 if email invalid', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'invalid-email',
            password: '123456',
        });
        expect(res.status).toBe(400);
    });

    it('401 if password too short', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'test@example.com',
            password: '123',
        });
        expect(res.status).toBe(400);
    });
});
