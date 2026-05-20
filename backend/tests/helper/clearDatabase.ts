import prisma from './db.config.js';

export const clearDatabase = async () => {
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.userAddress.deleteMany();
    await prisma.user.deleteMany();
};

export const clearUsers = async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.userAddress.deleteMany();
    await prisma.user.deleteMany();
};

export const clearProducts = async () => {
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
};

export const clearCategories = async () => {
    await prisma.category.deleteMany();
};

export const clearOrders = async () => {
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
};

export const clearCarts = async () => {
    await prisma.cart.deleteMany();
};

export const clearReviews = async () => {
    await prisma.review.deleteMany();
};

export const clearProductVariants = async () => {
    await prisma.productVariant.deleteMany();
};

export const clearCoupons = async () => {
    await prisma.coupon.deleteMany();
};

export const clearRefreshTokens = async () => {
    await prisma.refreshToken.deleteMany();
};

export const clearUserAddresses = async () => {
    await prisma.userAddress.deleteMany();
};

export const clearOrderItems = async () => {
    await prisma.orderItem.deleteMany();
};
