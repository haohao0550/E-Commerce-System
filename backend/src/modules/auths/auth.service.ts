import jwt from 'jsonwebtoken';
import crypto from 'node:crypto'
import * as argon2 from 'argon2';
import { AuthRepo } from './auth.repo.js';
import { RegisterInput, LoginInput } from './auth.dto.js';
import { appConfig } from '@/shared/configs/app.config.js';
import { AppError, UnauthorizedError, NotFoundError } from '@/shared/errors/app.error.js';

export class AuthService {
    private authRepo: AuthRepo;

    constructor() {
        this.authRepo = new AuthRepo();
    }

    private generateTokens(userId: string, role: string) {
        const jti = crypto.randomUUID();

        // Access Token
        const accessToken = jwt.sign(
            { userId, role, jti },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        // Refresh Token
        const refreshToken = jwt.sign(
            { userId, jti },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken, jti };
    }

    async register(input: RegisterInput) {
        // Check if email exists
        const existingUser = await this.authRepo.findUserByEmail(input.email);
        if (existingUser) {
            throw new AppError('Email already exists in the system', 400, 'EMAIL_EXISTS');
        }

        // Hash password with argon2
        const hashedPassword = await argon2.hash(input.password);

        const newUser = await this.authRepo.registerUser({
            email: input.email,
            password: hashedPassword,
            name: input.name,
            phone: input.phone,
        });

        const { accessToken, refreshToken, jti } = this.generateTokens(newUser.id, newUser.role);

        // Save Refresh Token to DB
        await this.authRepo.createRefreshToken({
            jti,
            refreshTokenHash: refreshToken, 
            user: { connect: { id: newUser.id } },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        return { user: newUser, accessToken, refreshToken };
    }

    async login(input: LoginInput) {
        const user = await this.authRepo.loginUser(input.email);
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Verify password with argon2
        const isPasswordValid = await argon2.verify(user.password, input.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const { accessToken, refreshToken, jti } = this.generateTokens(user.id, user.role);

        await this.authRepo.createRefreshToken({
            jti,
            refreshTokenHash: refreshToken,
            user: { connect: { id: user.id } },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return { user, accessToken, refreshToken };
    }

    async logout(jti: string) {
        // Mark token as revoked
        return this.authRepo.updateRefreshToken(jti, { revoked: true });
    }

    async refreshToken(token: string) {
        let decoded: any;
        
        try {
            decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
        
        // Find in DB
        const refreshTokenRecord = await this.authRepo.findRefreshTokenByJti(decoded.jti);
        
        if (!refreshTokenRecord || refreshTokenRecord.revoked || new Date(refreshTokenRecord.expiresAt) < new Date()) {
            throw new UnauthorizedError('Refresh token is invalid or has been revoked');
        }

        // Find User
        const user = await this.authRepo.findUserById(decoded.userId);
        if (!user) {
            throw new NotFoundError('User');
        }

        // Rotation: Generate new set of tokens
        const tokens = this.generateTokens(user.id, user.role);

        // Revoke old, create new
        await this.authRepo.updateRefreshToken(decoded.jti, { revoked: true });
        await this.authRepo.createRefreshToken({
            jti: tokens.jti,
            refreshTokenHash: tokens.refreshToken,
            user: { connect: { id: user.id } },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user
        };
    }
}
