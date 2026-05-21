import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';

export class DashboardController {
	private dashboardService: DashboardService;

	constructor() {
		this.dashboardService = new DashboardService();
	}

	async getTopProducts(req: Request, res: Response, next: NextFunction) {
		const { limit } = req.validatedQuery;
		const data = await this.dashboardService.getTopProducts({ limit });

		res.status(200).json({
			success: true,
			message: 'Get top products successful',
			data,
		});
	}

	async getRevenue(req: Request, res: Response, next: NextFunction) {
		const { startDate, endDate, groupBy } = req.validatedQuery;
		const data = await this.dashboardService.getRevenue({ startDate, endDate, groupBy });

		res.status(200).json({
			success: true,
			message: 'Get revenue successful',
			data,
		});
	}

	async getOrderCount(req: Request, res: Response, next: NextFunction) {
		const { startDate, endDate, groupBy } = req.validatedQuery;
		const data = await this.dashboardService.getOrderCount({ startDate, endDate, groupBy });

		res.status(200).json({
			success: true,
			message: 'Get order count successful',
			data,
		});
	}
}
