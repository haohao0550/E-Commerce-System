import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { ProductVariantsService } from './product-variants.service.js';

export class ProductVariantsController {
    constructor(private readonly productVariantsService = new ProductVariantsService()) {}

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.productVariantsService.getAll(req.query);

        return res.status(200).json({
            success: true,
            message: 'Get product variants successfully',
            data: result.variants,
            pagination: result.pagination,
        });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const variant = await this.productVariantsService.getById(id as string);

        return res.status(200).json({
            success: true,
            message: 'Get product variant successfully',
            data: variant,
        });
    });

    getByProductId = asyncHandler(async (req: Request, res: Response) => {
        const productId = req.params.productId;
        const variants = await this.productVariantsService.getByProductId(productId as string);

        return res.status(200).json({
            success: true,
            message: 'Get product variants successfully',
            data: variants,
        });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const productId = req.params.productId;
        const variant = await this.productVariantsService.create(productId as string, req.body);

        return res.status(201).json({
            success: true,
            message: 'Create product variant successfully',
            data: variant,
        });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const variant = await this.productVariantsService.update(id as string, req.body);

        return res.status(200).json({
            success: true,
            message: 'Update product variant successfully',
            data: variant,
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const variant = await this.productVariantsService.delete(id as string);

        return res.status(200).json({
            success: true,
            message: 'Delete product variant successfully',
            data: variant,
        });
    });
}
