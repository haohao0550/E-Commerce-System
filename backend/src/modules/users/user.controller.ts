import { Request, Response } from 'express';
import { UserService } from './user.service.js';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    getProfile = async (req: Request, res: Response) => {
        const { userId } = req.user;
        req.log?.info({ userId }, 'Getting current user profile');

        const user = await this.userService.getProfile(userId);

        res.status(200).json({
            success: true,
            message: 'Get profile successful',
            data: { user },
        });
    };

    updateProfile = async (req: Request, res: Response) => {
        const { userId } = req.user;
        req.log?.info({ userId }, 'Updating current user profile');

        const user = await this.userService.updateProfile(userId, req.body);

        res.status(200).json({
            success: true,
            message: 'Update profile successful',
            data: { user },
        });
    };

    changePassword = async (req: Request, res: Response) => {
        const { userId } = req.user;
        req.log?.info({ userId }, 'Changing current user password');

        await this.userService.changePassword(userId, req.body);
        res.clearCookie('refreshToken');

        res.status(200).json({
            success: true,
            message: 'Change password successful. Please login again.',
            data: {},
        });
    };

    deleteAccount = async (req: Request, res: Response) => {
        const { userId } = req.user;
        req.log?.info({ userId }, 'Deleting current user account');

        await this.userService.deleteAccount(userId);
        res.clearCookie('refreshToken');

        res.status(200).json({
            success: true,
            message: 'Delete account successful',
            data: {},
        });
    };

    getUsers = async (req: Request, res: Response) => {
        req.log?.info({ query: req.validatedQuery }, 'Admin getting users');

        const result = await this.userService.getUsers(req.validatedQuery);

        res.status(200).json({
            success: true,
            message: 'Get users successful',
            data: result,
        });
    };

    getUserById = async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const user = await this.userService.getUserById(id);

        res.status(200).json({
            success: true,
            message: 'Get user successful',
            data: { user },
        });
    };

    updateUserRole = async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const user = await this.userService.updateUserRole(id, req.body);

        res.status(200).json({
            success: true,
            message: 'Update user role successful',
            data: { user },
        });
    };

    deleteUserByAdmin = async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const user = await this.userService.deleteUserByAdmin(id);

        res.status(200).json({
            success: true,
            message: 'Delete user successful',
            data: { user },
        });
    };

    restoreUserByAdmin = async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const user = await this.userService.restoreUserByAdmin(id);

        res.status(200).json({
            success: true,
            message: 'Restore user successful',
            data: { user },
        });
    };
}
