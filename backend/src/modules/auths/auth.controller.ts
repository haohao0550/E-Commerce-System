import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AppError } from '@/shared/errors/app.error.js';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    private setRefreshTokenCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.log?.info({ email: req.body.email }, 'Starting user registration process');
            
            const result = await this.authService.register(req.body);
            this.setRefreshTokenCookie(res, result.refreshToken);
            
            req.log?.info({ userId: result.user.id }, 'User registered successfully');

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        name: result.user.name,
                        phone: result.user.phone,
                        role: result.user.role,
                    },
                    accessToken: result.accessToken,
                },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message, body: req.body }, 'Error during registration process');
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.log?.info({ email: req.body.email }, 'User attempting to login');

            const result = await this.authService.login(req.body);
            this.setRefreshTokenCookie(res, result.refreshToken);

            req.log?.info({ userId: result.user.id }, 'Login successful');

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        name: result.user.name,
                        phone: result.user.phone,
                        role: result.user.role,
                    },
                    accessToken: result.accessToken,
                },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message, email: req.body.email }, 'Login failed');
            next(error);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { jti, userId } = req.user;
            req.log?.info({ userId, jti }, 'User requested logout');

            await this.authService.logout(jti);
            
            res.clearCookie('refreshToken');
            
            req.log?.info({ userId }, 'Logged out and token revoked successfully');

            res.status(200).json({
                success: true,
                message: 'Logout successful',
                data: {}
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error during logout');
            next(error);
        }
    };

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.refreshToken;
            if (!token) {
                req.log?.warn('Refresh token requested but no cookie found');
                throw new AppError('Refresh token missing', 401, 'REFRESH_TOKEN_MISSING');
            }

            req.log?.info('Refreshing access token');
            
            const result = await this.authService.refreshToken(token);
            
            // Defensive check
            if (!result || !result.refreshToken) {
                throw new AppError('Failed to refresh token', 500, 'REFRESH_FAILED');
            }

            this.setRefreshTokenCookie(res, result.refreshToken);

            req.log?.info({ userId: result.user.id }, 'Token refreshed successfully');

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.accessToken,
                },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error during token refresh');
            next(error);
        }
    };
}
