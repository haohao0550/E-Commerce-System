export interface TopProductsQuery {
    limit: number;
}

export interface RevenueQuery {
    startDate?: Date;
    endDate?: Date;
    groupBy: 'day' | 'month' | 'year';
}

export interface OrderCountQuery extends RevenueQuery {}
