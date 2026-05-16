import type { Request, Response } from 'express'
import { asyncHandler } from '@/shared/errors/async-handler.error.js'
import { CategoriesService } from './categories.service.js'

export class CategoriesController {
  constructor(private readonly categoriesService = new CategoriesService()) {}

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.categoriesService.getAll()

    return res.status(200).json({
      success: true,
      message: 'Get categories successfully',
      data: categories
    })
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id
    const category = await this.categoriesService.getById(id as string)

    return res.status(200).json({
      success: true,
      message: 'Get category successfully',
      data: category
    })
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;

    console.log('Creating category with name:', name); // Debug log
    const category = await this.categoriesService.create({ name })

    return res.status(201).json({
      success: true,
      message: 'Create category successfully',
      data: category
    })
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id
    const { name } = req.body;
    const category = await this.categoriesService.update(id as string, { name })

    return res.status(200).json({
      success: true,
      message: 'Update category successfully',
      data: category
    })
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug
    const category = await this.categoriesService.getBySlug(slug as string)

    return res.status(200).json({
      success: true,
      message: 'Get category by slug successfully',
      data: category
    })
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id
    const category = await this.categoriesService.delete(id as string)

    return res.status(200).json({
      success: true,
      message: 'Delete category successfully',
      data: category
    })
  })
}