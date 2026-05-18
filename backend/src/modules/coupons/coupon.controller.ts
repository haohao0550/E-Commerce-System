import { Request, Response } from 'express';
import { CouponService } from './coupon.service.js';

export class CouponController {
    private couponService: CouponService;

    constructor() {
        this.couponService = new CouponService();
    }

    validateCoupon = async (req: Request, res: Response) => {
        const result = await this.couponService.validateCoupon(req.body);

        res.status(200).json({
            success: true,
            message: 'Validate coupon successful',
            data: result,
        });
    };

    getCoupons = async (req: Request, res: Response) => {
        const result = await this.couponService.getCoupons(req.validatedQuery);

        res.status(200).json({
            success: true,
            message: 'Get coupons successful',
            data: result,
        });
    };

    createCoupon = async (req: Request, res: Response) => {
        const coupon = await this.couponService.createCoupon(req.body);

        res.status(201).json({
            success: true,
            message: 'Create coupon successful',
            data: { coupon },
        });
    };

    updateCoupon = async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const coupon = await this.couponService.updateCoupon(id, req.body);

        res.status(200).json({
            success: true,
            message: 'Update coupon successful',
            data: { coupon },
        });
    };

    deleteCoupon = async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const coupon = await this.couponService.deleteCoupon(id);

        res.status(200).json({
            success: true,
            message: 'Delete coupon successful',
            data: { coupon },
        });
    };
}
