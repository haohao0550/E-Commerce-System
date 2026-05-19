import slugify from 'slugify';
import prisma from '@/shared/configs/db.config.js';
import type { CreateProductDTO, ProductQueryDTO, UpdateProductDTO } from './products.dto.js';
import type { IProductsRepo } from './products.repo.interface.js';
import { ProductsRepo } from './products.repo.js';
import { BadRequestError, NotFoundError } from '@/shared/errors/app.error.js';

export class ProductsService {
    constructor(private readonly productsRepo: IProductsRepo = new ProductsRepo()) {}

    async getAll(query: ProductQueryDTO) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const { products, total } = await this.productsRepo.findAll(query);

        return {
            products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }

    async getBySlug(slug: string) {
        const product = await this.productsRepo.findBySlug(slug);

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        return product;
    }

    async create(data: CreateProductDTO) {
        if (data.categoryId) {
            await this.ensureCategoryExists(data.categoryId);
        }

        const slug = await this.generateUniqueSlug(data.name);

        return this.productsRepo.create({
            name: data.name,
            slug,
            description: data.description,
            basePrice: data.basePrice,
            images: data.images || [],
            categoryId: data.categoryId,
        });
    }

    async update(id: string, data: UpdateProductDTO) {
        const product = await this.productsRepo.findById(id);

        if (!product || product.isDeleted) {
            throw new NotFoundError('Product not found');
        }

        if (data.categoryId) {
            await this.ensureCategoryExists(data.categoryId);
        }

        const payload = {
            ...data,
            ...(data.name && data.name !== product.name
                ? {
                      slug: await this.generateUniqueSlug(data.name, product.id),
                  }
                : {}),
        };

        return this.productsRepo.update(id, payload as any);
    }

    async delete(id: string) {
        const product = await this.productsRepo.findById(id);

        if (!product || product.isDeleted) {
            throw new NotFoundError('Product not found');
        }

        return this.productsRepo.softDelete(id);
    }

    async restore(id: string) {
        const product = await this.productsRepo.findById(id);

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        if (!product.isDeleted) {
            throw new BadRequestError('Product is not deleted');
        }

        return this.productsRepo.restore(id);
    }

    private async ensureCategoryExists(categoryId: string) {
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }
    }

    private async generateUniqueSlug(name: string, currentProductId?: string) {
        const baseSlug = slugify(name, {
            lower: true,
            strict: true,
            trim: true,
        });

        let slug = baseSlug;
        let count = 1;

        while (true) {
            const existedProduct = await this.productsRepo.findBySlugIncludingDeleted(slug);

            if (!existedProduct || existedProduct.id === currentProductId) {
                return slug;
            }

            slug = `${baseSlug}-${count}`;
            count++;
        }
    }

    async getProductById(id: string) {
        const product = await this.productsRepo.findById(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        return product;
    }
}
