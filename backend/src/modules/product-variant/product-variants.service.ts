import prisma from '@/shared/configs/db.config.js';
import type {
    CreateProductVariantDTO,
    ProductVariantQueryDTO,
    UpdateProductVariantDTO,
} from './product-variants.dto.js';
import type { IProductVariantsRepo } from './product-variants.repo.interface.js';
import { ProductVariantsRepo } from './product-variants.repo.js';
import { BadRequestError, NotFoundError } from '@/shared/errors/app.error.js';

export class ProductVariantsService {
    constructor(
        private readonly productVariantsRepo: IProductVariantsRepo = new ProductVariantsRepo(),
    ) {}

    async getAll(query: ProductVariantQueryDTO) {
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 10);
        const { variants, total } = await this.productVariantsRepo.findAll(query);

        return {
            variants,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getById(id: string) {
        const variant = await this.productVariantsRepo.findById(id);

        if (!variant) {
            throw new NotFoundError('Product variant not found');
        }

        return variant;
    }

    async getByProductId(productId: string) {
        await this.ensureProductExists(productId);

        return this.productVariantsRepo.findByProductId(productId);
    }

    async create(productId: string, data: CreateProductVariantDTO) {
        await this.ensureProductExists(productId);
        await this.ensureSkuNotExists(data.sku);
        await this.ensureColorSizeNotExists(productId, data.color, data.size);

        return this.productVariantsRepo.create({
            productId,
            sku: data.sku,
            color: data.color,
            size: data.size,
            price: data.price,
            stock: data.stock ?? 0,
        });
    }

    async update(id: string, data: UpdateProductVariantDTO) {
        const variant = await this.productVariantsRepo.findById(id);

        if (!variant) {
            throw new NotFoundError('Product variant not found');
        }

        if (data.sku && data.sku !== variant.sku) {
            await this.ensureSkuNotExists(data.sku);
        }

        const color = data.color !== undefined ? data.color : variant.color;
        const size = data.size !== undefined ? data.size : variant.size;

        if (color !== variant.color || size !== variant.size) {
            const existedVariant = await this.productVariantsRepo.findByProductColorSize(
                variant.productId,
                color,
                size,
            );

            if (existedVariant && existedVariant.id !== id) {
                throw new BadRequestError('Product variant color and size already exists');
            }
        }

        return this.productVariantsRepo.update(id, data);
    }

    async delete(id: string) {
        const variant = await this.productVariantsRepo.findById(id);

        if (!variant) {
            throw new NotFoundError('Product variant not found');
        }

        return this.productVariantsRepo.delete(id);
    }

    private async ensureProductExists(productId: string) {
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                isDeleted: false,
            },
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }
    }

    private async ensureSkuNotExists(sku: string) {
        const variant = await this.productVariantsRepo.findBySku(sku);

        if (variant) {
            throw new BadRequestError('SKU already exists');
        }
    }

    private async ensureColorSizeNotExists(
        productId: string,
        color?: string | null,
        size?: string | null,
    ) {
        const variant = await this.productVariantsRepo.findByProductColorSize(
            productId,
            color,
            size,
        );

        if (variant) {
            throw new BadRequestError('Product variant color and size already exists');
        }
    }
}
