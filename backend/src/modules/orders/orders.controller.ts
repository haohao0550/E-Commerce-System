import type { Request, Response } from 'express';
import { OrdersService } from './orders.service.js';

export class OrdersController {
    constructor(private readonly ordersService = new OrdersService()) {}

    // ==========================================
    // USER APIS (Yêu cầu login)
    // ==========================================

    createOrder = async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const order = await this.ordersService.createOrder(userId, req.body);

        return res.status(201).json({
            success: true,
            message: 'Create order successfully',
            data: order,
        });
    };

    getUserOrders = async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const query = { ...(req.validatedQuery || req.query), userId };
        const result = await this.ordersService.getOrders(query);

        return res.status(200).json({
            success: true,
            message: 'Get user orders successfully',
            data: result.orders,
            pagination: result.pagination,
        });
    };

    getUserOrderById = async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const id = req.params.id as string;

        const order = await this.ordersService.getOrderById(id, userId);

        return res.status(200).json({
            success: true,
            message: 'Get order details successfully',
            data: order,
        });
    };

    cancelOrder = async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const id = req.params.id as string;

        const order = await this.ordersService.cancelOrder(id, userId);

        return res.status(200).json({
            success: true,
            message: 'Cancel order successfully',
            data: order,
        });
    };

    // ==========================================
    // ADMIN APIS (Yêu cầu quyền Admin)
    // ==========================================

    getAllOrders = async (req: Request, res: Response) => {
        const result = await this.ordersService.getOrders(req.validatedQuery || req.query);

        return res.status(200).json({
            success: true,
            message: 'Get all orders successfully',
            data: result.orders,
            pagination: result.pagination,
        });
    };

    getOrderById = async (req: Request, res: Response) => {
        const id = req.params.id as string;

        // Bypass quyền sở hữu
        const order = await this.ordersService.getOrderById(id);

        return res.status(200).json({
            success: true,
            message: 'Get order details successfully',
            data: order,
        });
    };

    updateOrderStatus = async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const { status } = req.body;

        const order = await this.ordersService.updateOrderStatus(id, status);

        return res.status(200).json({
            success: true,
            message: 'Update order status successfully',
            data: order,
        });
    };

    updatePaymentStatus = async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const { paymentStatus } = req.body;

        const order = await this.ordersService.updatePaymentStatus(id, paymentStatus);

        return res.status(200).json({
            success: true,
            message: 'Update payment status successfully',
            data: order,
        });
    };
}
