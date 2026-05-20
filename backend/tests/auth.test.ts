import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import * as helper from './helper/index.js';

describe('POST /api/v1/auth/register', () => {
    beforeEach(async () => {
        await helper.clear.clearUsers();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('201 + returns user when valid', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: '123456',
        });

        expect(res.status).toBe(201);
        expect(res.body.data.user.email).toBe('test@example.com');
        expect(res.body.data.user.id).toBeDefined();
        expect(res.body.data.user.role).toBe('USER');
        expect(res.body.data.accessToken).toBeDefined();

        const setCookie = res.headers['set-cookie'];
        expect(setCookie).toBeDefined();
        expect(String(setCookie)).toContain('refreshToken=');
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

describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
        await helper.clear.clearUsers();
        await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: '123456',
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('200 + returns access token and refresh token when valid', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            email: 'test@example.com',
            password: '123456',
        });

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe('test@example.com');
        expect(res.body.data.user.id).toBeDefined();
        expect(res.body.data.user.role).toBe('USER');
        expect(res.body.data.accessToken).toBeDefined();

        const setCookie = res.headers['set-cookie'];
        expect(setCookie).toBeDefined();
        expect(String(setCookie)).toContain('refreshToken=');
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

describe('POST /api/v1/auth/refresh', () => {
    let cookies: any;
    beforeEach(async () => {
        await helper.clear.clearUsers();
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: '123456',
        });
        cookies = res.headers['set-cookie'];
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('200 + returns new token when valid', async () => {

        const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookies);
        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
    });

    it('400 if refresh token is missing', async () => {
        const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', []);
        expect(res.status).toBe(401);
    });

    it('401 if refresh token is invalid', async () => {
        const res = await request(app).post('/api/v1/auth/refresh').send().set('Cookie', ['refreshToken=invalidtoken']);
        expect(res.status).toBe(401);
    });

    it('401 if refresh token is expired', async () => {
        vi.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new jwt.TokenExpiredError('jwt expired', new Date());
        });

        const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', cookies);

        expect(res.status).toBe(401);
    });
});

describe('POST /api/v1/auth/logout', () => {
    let cookies: any, access: any;
    beforeEach(async () => {
        await helper.clear.clearUsers();
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: '123456',
        });
        cookies = res.headers['set-cookie'];
        access = res.body.data.accessToken;
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('200 + clears refresh token cookie', async () => {
        const res = await request(app).post('/api/v1/auth/logout')
            .set('Cookie', cookies)
            .set('Authorization', `Bearer ${access}`);
        expect(res.status).toBe(200);
    });

    it('401 if refresh token is missing', async () => {
        const res = await request(app).post('/api/v1/auth/logout').set('Cookie', []);
        expect(res.status).toBe(401);
    });

    it('401 if refresh token is valid', async () => {
        const res = await request(app).post('/api/v1/auth/logout').set('Cookie', ["refreshToken=invalidtoken"]);
        expect(res.status).toBe(401);
    });
});