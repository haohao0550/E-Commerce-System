import * as dto from './dashboard.dto.js';
import { DashboardRepo } from './dashboard.repo.js';
import * as error from '@/shared/errors/app.error.js';

export class DashboardService {
	private dashboardRepo: DashboardRepo;

	constructor() {
		this.dashboardRepo = new DashboardRepo();
	}

	private formatPeriod(date: Date, groupBy: NonNullable<dto.RevenueQuery['groupBy']>) {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');

		if (groupBy === 'year') return String(year);
		if (groupBy === 'month') return `${year}-${month}`;
		return `${year}-${month}-${day}`;
	}

	private formatHour(date: Date) {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		const hour = String(d.getHours()).padStart(2, '0');
		return `${year}-${month}-${day} ${hour}:00`;
	}

	private generatePeriods(start: Date, end: Date, groupBy: NonNullable<dto.RevenueQuery['groupBy']>, hourly = false) {
		const periods: string[] = [];
		const s = new Date(start);
		const e = new Date(end);

		if (hourly) {
			const cur = new Date(s);
			cur.setMinutes(0, 0, 0);
			while (cur <= e) {
				periods.push(this.formatHour(cur));
				cur.setHours(cur.getHours() + 1);
			}
			return periods;
		}

		if (groupBy === 'day') {
			const cur = new Date(s);
			cur.setHours(0, 0, 0, 0);
			while (cur <= e) {
				periods.push(this.formatPeriod(cur, 'day'));
				cur.setDate(cur.getDate() + 1);
			}
			return periods;
		}

		if (groupBy === 'month') {
			const cur = new Date(s.getFullYear(), s.getMonth(), 1);
			while (cur <= e) {
				periods.push(this.formatPeriod(cur, 'month'));
				cur.setMonth(cur.getMonth() + 1);
			}
			return periods;
		}

		const cur = new Date(s.getFullYear(), 0, 1);
		while (cur <= e) {
			periods.push(this.formatPeriod(cur, 'year'));
			cur.setFullYear(cur.getFullYear() + 1);
		}
		return periods;
	}

    private async filterAndGroupOrders(query: dto.RevenueQuery | dto.OrderCountQuery) {
        const gb = query.groupBy ?? 'day';
		const now = new Date();

		let start: Date | undefined = query.startDate ? new Date(query.startDate) : undefined;
		let end: Date | undefined = query.endDate ? new Date(query.endDate) : undefined;

		let hourly = false;
		let actualGroupBy: NonNullable<dto.RevenueQuery['groupBy']> = gb;

		if (!start && !end) {
			if (gb === 'day') {
				hourly = true;
				end = new Date(now);
				end.setMinutes(0, 0, 0);
				start = new Date(end);
				start.setHours(start.getHours() - 23);
				actualGroupBy = 'day';
			} else if (gb === 'month') {
				end = new Date(now);
				end.setHours(23, 59, 59, 999);
				start = new Date(now);
				start.setDate(start.getDate() - 29);
				start.setHours(0, 0, 0, 0);
				actualGroupBy = 'day';
			} else {
				end = new Date(now);
				end.setHours(23, 59, 59, 999);
				start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
				start.setHours(0, 0, 0, 0);
				actualGroupBy = 'month';
			}
		} else {
			if (start) start = new Date(start);
			if (end) {
				end = new Date(end);
				if (gb !== 'day') {
					end.setHours(23, 59, 59, 999);
				}
			}
			actualGroupBy = gb;
		}

        return { start: start as Date, end: end as Date, groupBy: actualGroupBy, hourly };
    }

    async getTopProducts(query: dto.TopProductsQuery) {
		const { limit = 10 } = query;
		const rows: any[] = await this.dashboardRepo.getTopProducts(limit);
		return rows.map((r) => ({
			productName: r.productName,
			quantity: r._sum?.quantity ?? 0,
		}));
	}

	async getRevenue(query: dto.RevenueQuery) {
		const { start, end, groupBy, hourly } = await this.filterAndGroupOrders(query);

		const s = start as Date;
		const e = end as Date;

		const periods = this.generatePeriods(s, e, groupBy, hourly);
		const map = new Map<string, number>();
		for (const p of periods) map.set(p, 0);

		const orders = await this.dashboardRepo.getOrdersWithinRange(s, e);

		for (const o of orders) {
			const created = new Date(o.createdAt);
			const key = hourly ? this.formatHour(created) : this.formatPeriod(created, groupBy);
			map.set(key, (map.get(key) ?? 0) + Number(o.finalPrice ?? 0));
		}

		const result = periods.map((period) => ({ period, revenue: map.get(period) ?? 0 }));
        if (result.length > 50)
            throw new error.AppError('Too many data points. Please narrow down the date range or increase the grouping period.');
		return result;
	}

	async getOrderCount(query: dto.OrderCountQuery) {
		const { start, end, groupBy, hourly } = await this.filterAndGroupOrders(query);

		const s = start as Date;
		const e = end as Date;
		const periods = this.generatePeriods(s, e, groupBy, hourly);
		const map = new Map<string, number>();
		for (const p of periods) map.set(p, 0);

		const orders = await this.dashboardRepo.getOrdersWithinRange(s, e);

		for (const o of orders) {
			const created = new Date(o.createdAt);
			const key = hourly ? this.formatHour(created) : this.formatPeriod(created, groupBy);
			map.set(key, (map.get(key) ?? 0) + 1);
		}

		const result = periods.map((period) => ({ period, count: map.get(period) ?? 0 }));
        if (result.length > 50)            
            throw new error.AppError('Too many data points. Please narrow down the date range or increase the grouping period.');
		return result;
	}
}
