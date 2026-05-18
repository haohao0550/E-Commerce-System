import type { Order, OrderStatus, PaymentStatus } from '@/generated/prisma/client.js'
import type { OrderQueryDTO, OrderUpdateData, OrderResponse } from './orders.dto.js'

export type OrderItemCreateRepoInput = {
  variantId?: string
  productName: string
  variantInfo?: string
  price: number
  quantity: number
}

export type CreateOrderTransactionInput = {
  userId: string
  status?: OrderStatus
  paymentMethod?: any // PaymentMethod enum
  paymentStatus?: PaymentStatus
  totalPrice: number
  shippingFee: number
  discountAmount: number
  finalPrice: number
  shippingAddress: any
  couponId?: string
  note?: string
  items: OrderItemCreateRepoInput[]
}

export interface IOrdersRepo {
  /**
   * Lấy danh sách Order (có phân trang, lọc theo user, status...)
   */
  findAll(query: OrderQueryDTO): Promise<{ orders: OrderResponse[], total: number }>

  /**
   * Lấy chi tiết 1 Order kèm theo danh sách items bên trong
   */
  findById(id: string): Promise<OrderResponse | null>

  /**
   * Thực hiện Transaction tạo Đơn hàng bao gồm:
   * 1. Tạo bảng Order
   * 2. Tạo nhiều bảng OrderItem
   * 3. Trừ số lượng (stock) trong ProductVariant
   * 4. Xóa các sản phẩm đã mua khỏi bảng Cart của user
   */
  createOrderTransaction(
    data: CreateOrderTransactionInput,
    cartItemIdsToDelete?: string[]
  ): Promise<OrderResponse>

  /**
   * Cập nhật thông tin chung của đơn hàng
   */
  update(id: string, data: OrderUpdateData): Promise<Order>

  /**
   * Hàm đặc thù để cập nhật trạng thái đơn hàng nhanh chóng
   */
  updateStatus(id: string, status: OrderStatus): Promise<Order>

  /**
   * Hàm đặc thù để cập nhật trạng thái thanh toán
   */
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order>

  /**
   * Transaction hủy đơn hàng: Cập nhật status, hoàn lại kho, hoàn lại coupon
   */
  cancelOrderTransaction(
    id: string,
    items: { variantId: string | null; quantity: number }[],
    couponId: string | null
  ): Promise<OrderResponse>
}
