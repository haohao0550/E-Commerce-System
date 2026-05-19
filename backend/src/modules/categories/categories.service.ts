import slugify from 'slugify';
import type { CreateCategoryDTO, UpdateCategoryDTO } from './categories.dto.js';
import type { ICategoriesRepo } from './categories.repo.interface.js';
import { CategoriesRepo } from './categories.repo.js';
import { BadRequestError, NotFoundError } from '@/shared/errors/app.error.js';

export class CategoriesService {
    constructor(private readonly categoriesRepo: ICategoriesRepo = new CategoriesRepo()) {}

    async getAll() {
        return this.categoriesRepo.findAll();
    }

    async getById(id: string) {
        const category = await this.categoriesRepo.findById(id);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return category;
    }

    async create(data: CreateCategoryDTO) {
        const slug = this.generateSlug(data.name);
        const existedCategory = await this.categoriesRepo.findBySlug(slug);

        if (existedCategory) {
            throw new BadRequestError('Category already exists');
        }

        return this.categoriesRepo.create({
            name: data.name,
            slug,
        });
    }

    async update(id: string, data: UpdateCategoryDTO) {
        const category = await this.categoriesRepo.findById(id);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        const payload: UpdateCategoryDTO & { slug?: string } = { ...data };

        if (data.name && data.name !== category.name) {
            const slug = this.generateSlug(data.name);
            const existedCategory = await this.categoriesRepo.findBySlug(slug);

            if (existedCategory && existedCategory.id !== id) {
                throw new BadRequestError('Category already exists');
            }

            payload.slug = slug;
        }

        return this.categoriesRepo.update(id, payload);
    }

    async delete(id: string) {
        const category = await this.categoriesRepo.findById(id);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return this.categoriesRepo.delete(id);
    }

    async getBySlug(slug: string) {
        const category = await this.categoriesRepo.findBySlug(slug);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return category;
    }

    private generateSlug(name: string) {
        return slugify(name, {
            lower: true,
            strict: true,
            trim: true,
        });
    }
}
