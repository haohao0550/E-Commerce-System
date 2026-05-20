import type { Request, Response } from 'express';
import { asyncHandler } from '@/shared/errors/async-handler.error.js';
import { ProductsService } from './products.service.js';

export class ProductsController {
    constructor(private readonly productsService = new ProductsService()) {}

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.productsService.getAll(req.validatedQuery || req.query);

        return res.status(200).json({
            success: true,
            message: 'Get products successfully',
            data: result.products,
            pagination: result.pagination,
        });
    });

    getBySlug = asyncHandler(async (req: Request, res: Response) => {
        const slug = req.params.slug;
        const product = await this.productsService.getBySlug(slug as string);

        return res.status(200).json({
            success: true,
            message: 'Get product successfully',
            data: product,
        });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const product = await this.productsService.create(req.body);

        return res.status(201).json({
            success: true,
            message: 'Create product successfully',
            data: product,
        });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await this.productsService.update(id as string, req.body);

        return res.status(200).json({
            success: true,
            message: 'Update product successfully',
            data: product,
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await this.productsService.delete(id as string);

        return res.status(200).json({
            success: true,
            message: 'Delete product successfully',
            data: product,
        });
    });

    restore = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await this.productsService.restore(id as string);

        return res.status(200).json({
            success: true,
            message: 'Restore product successfully',
            data: product,
        });
    });

    getProductById = asyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await this.productsService.getProductById(id as string);

        return res.status(200).json({
            success: true,
            message: 'Get product by id successfully',
            data: product,
        });
    });
}
