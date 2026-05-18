import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service.js';

export class CartController {
	private cartService: CartService;

	constructor() {
		this.cartService = new CartService();
	}

	async getCarts(req: Request, res: Response, next: NextFunction) {
		const { userId } = req.user;
		const carts = await this.cartService.getCarts(userId, req.validatedQuery);

		res.status(200).json({
			success: true,
			message: 'Get cart successfully',
			data: carts,
		});
	}

	async addToCart(req: Request, res: Response, next: NextFunction) {
		const { userId } = req.user;
		const item = await this.cartService.addToCart(userId, req.body);

		res.status(201).json({
			success: true,
			message: 'Add to cart successfully',
			data: item,
		});
	}

	async updateCartItem(req: Request, res: Response, next: NextFunction) {
		const { userId } = req.user;
		const { id } = req.params;
		const item = await this.cartService.updateCartItem(userId, id.toString(), req.body);

		res.status(200).json({
			success: true,
			message: 'Update cart item successfully',
			data: item,
		});
	}

	async deleteCartItem(req: Request, res: Response, next: NextFunction) {
		const { userId } = req.user;
		const { id } = req.params;
		await this.cartService.deleteCartItem(userId, id.toString());

		res.status(200).json({
			success: true,
			message: 'Delete cart item successfully',
			data: {},
		});
	}

	async clearCart(req: Request, res: Response, next: NextFunction) {
		const { userId } = req.user;
		await this.cartService.clearCart(userId);

		res.status(200).json({
			success: true,
			message: 'Clear cart successfully',
			data: {},
		});
	}

	async validateCart(req: Request, res: Response, next: NextFunction) {
		const { userId } = req.user;
		const result = await this.cartService.validateCart(userId, req.body);

		res.status(200).json({
			success: true,
			message: 'Validate cart successfully',
			data: result,
		});
	}

	async getCartCount(req: Request, res: Response, next: NextFunction) {
		const { userId } = req.user;
		const result = await this.cartService.getCartCount(userId);

		res.status(200).json({
			success: true,
			message: 'Get cart count successfully',
			data: result,
		});
	}
}
