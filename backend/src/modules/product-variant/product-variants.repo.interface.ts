import type { ProductVariant } from '@/generated/prisma/client.js';
import type {
    ProductVariantCreateData,
    ProductVariantQueryDTO,
    ProductVariantUpdateData,
} from './product-variants.dto.js';

export interface IProductVariantsRepo {
    findAll(query: ProductVariantQueryDTO): Promise<{
        variants: ProductVariant[];
        total: number;
    }>;

    findById(id: string): Promise<ProductVariant | null>;
    findByProductId(productId: string): Promise<ProductVariant[]>;
    findBySku(sku: string): Promise<ProductVariant | null>;
    findByProductColorSize(
        productId: string,
        color?: string | null,
        size?: string | null,
    ): Promise<ProductVariant | null>;

    create(data: ProductVariantCreateData): Promise<ProductVariant>;
    update(id: string, data: ProductVariantUpdateData): Promise<ProductVariant>;
    delete(id: string): Promise<ProductVariant>;
}
