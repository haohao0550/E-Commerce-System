export type DashboardGroupBy = 'day' | 'month' | 'year';

export interface DashboardQuery {
  groupBy?: DashboardGroupBy;
  startDate?: string;
  endDate?: string;
}

export interface RevenuePoint {
  period: string;
  revenue: number;
}

export interface OrderCountPoint {
  period: string;
  count: number;
}
