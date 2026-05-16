import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service.js';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.user;
            req.log?.info({ userId }, 'Getting current user profile');

            const user = await this.userService.getProfile(userId);

            res.status(200).json({
                success: true,
                message: 'Get profile successful',
                data: { user },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while getting profile');
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.user;
            req.log?.info({ userId }, 'Updating current user profile');

            const user = await this.userService.updateProfile(userId, req.body);

            res.status(200).json({
                success: true,
                message: 'Update profile successful',
                data: { user },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while updating profile');
            next(error);
        }
    };

    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.user;
            req.log?.info({ userId }, 'Changing current user password');

            await this.userService.changePassword(userId, req.body);
            res.clearCookie('refreshToken');

            res.status(200).json({
                success: true,
                message: 'Change password successful. Please login again.',
                data: {},
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while changing password');
            next(error);
        }
    };

    deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.user;
            req.log?.info({ userId }, 'Deleting current user account');

            await this.userService.deleteAccount(userId);
            res.clearCookie('refreshToken');

            res.status(200).json({
                success: true,
                message: 'Delete account successful',
                data: {},
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while deleting account');
            next(error);
        }
    };
}
