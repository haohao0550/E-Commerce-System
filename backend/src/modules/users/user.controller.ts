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

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.log?.info({ query: req.validatedQuery }, 'Admin getting users');

            const result = await this.userService.getUsers(req.validatedQuery);

            res.status(200).json({
                success: true,
                message: 'Get users successful',
                data: result,
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while getting users');
            next(error);
        }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const user = await this.userService.getUserById(id);

            res.status(200).json({
                success: true,
                message: 'Get user successful',
                data: { user },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while getting user');
            next(error);
        }
    };

    updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const user = await this.userService.updateUserRole(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Update user role successful',
                data: { user },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while updating user role');
            next(error);
        }
    };

    deleteUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const user = await this.userService.deleteUserByAdmin(id);

            res.status(200).json({
                success: true,
                message: 'Delete user successful',
                data: { user },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while deleting user');
            next(error);
        }
    };

    restoreUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const user = await this.userService.restoreUserByAdmin(id);

            res.status(200).json({
                success: true,
                message: 'Restore user successful',
                data: { user },
            });
        } catch (error: any) {
            req.log?.error({ error: error.message }, 'Error while restoring user');
            next(error);
        }
    };
}
