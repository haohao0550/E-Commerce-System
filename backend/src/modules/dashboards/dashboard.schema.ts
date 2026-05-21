import zod from 'zod';

const DateRangeQuerySchema = zod.object({
        startDate: zod.coerce.date().optional(),
        endDate: zod.coerce.date().optional(),
    })
    .refine(
        (data) => {
        if (!data.startDate || !data.endDate) return true;
            return data.startDate <= data.endDate;
        },
        {
            message: 'startDate must be less than or equal to endDate.',
            path: ['endDate'],
        }
    );

export const TopProductsQuerySchema = zod.object({
  limit: zod.coerce.number().int().positive().max(100).default(10)
});

export const RevenueQuerySchema = DateRangeQuerySchema.extend({
    groupBy: zod.enum(['day', 'month', 'year']).default('day')
});

export const OrderCountQuerySchema = DateRangeQuerySchema.extend({
    groupBy: zod.enum(['day', 'month', 'year']).default('day')
});