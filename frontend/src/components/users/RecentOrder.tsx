import { useState, useEffect } from 'react';
import { Package, Clock, ShieldCheck, XCircle, ArrowRight, RefreshCw, AlertTriangle, Truck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { orderService, Order } from '@/features/orders/services/order.service';

export const RecentOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getUserOrders({ limit: 50 });
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      showToast(err.message || 'Failed to fetch order history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(orderId);
    try {
      await orderService.cancelOrder(orderId);
      showToast('Order cancelled successfully', 'success');
      // Update local status immediately
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setIsCancelling(null);
    }
  };

  // Helper for status badge styling
  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      default:
        return 'bg-surface-low text-on-surface-variant border border-outline-variant/10';
    }
  };

  const getPaymentStatusStyle = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 font-bold';
      case 'UNPAID':
        return 'bg-amber-50 text-amber-700 font-medium';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 font-bold';
      default:
        return 'bg-surface-low text-on-surface-variant';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        {[1, 2].map((n) => (
          <div key={n} className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm animate-pulse space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-surface-container rounded w-1/4" />
              <div className="h-6 bg-surface-container rounded w-20" />
            </div>
            <div className="h-16 bg-surface-container rounded w-full" />
            <div className="h-10 bg-surface-container rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-outline-variant/20 shadow-sm p-8 w-full">
        <Package className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-black uppercase mb-1">No Orders Found</h3>
        <p className="text-xs text-on-surface-variant font-medium mb-6">You haven&apos;t placed any premium orders yet.</p>
        <a
          href="/"
          className="inline-flex items-center justify-center bg-black text-white px-6 py-3.5 font-bold uppercase tracking-widest text-[10px] rounded hover:bg-black/90 transition-all shadow-md active:scale-95 animate-bounce"
        >
          Browse Catalog
        </a>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop';

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-2">
        <h2 className="text-xl font-display font-black uppercase tracking-tight text-black">Order History ({orders.length})</h2>
        <button
          type="button"
          onClick={fetchOrders}
          className="p-2 text-on-surface-variant hover:text-black transition-colors rounded-full hover:bg-surface-low cursor-pointer"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {orders.map((order) => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <section
            key={order.id}
            className="bg-white p-6 md:p-8 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Top Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4 mb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                  Order ID: <span className="text-black select-all font-black">{order.id}</span>
                </span>
                <p className="text-xs text-on-surface-variant font-medium">Placed on {orderDate}</p>
              </div>
              <div className="flex flex-wrap gap-2.5 items-center">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${getPaymentStatusStyle(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {order.items?.map((item) => {
                // Extract image from variant/product if populated
                let imgUrl = defaultImage;
                const imagesJson = item.variant?.product?.images;
                if (imagesJson) {
                  try {
                    const parsed = typeof imagesJson === 'string' ? JSON.parse(imagesJson) : imagesJson;
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      imgUrl = parsed[0];
                    }
                  } catch (e) {
                    // Fallback
                  }
                }

                return (
                  <div key={item.id} className="flex gap-4 items-center border-b border-outline-variant/10 pb-4 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-surface-low rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/10">
                      <img
                        src={imgUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black uppercase truncate">{item.productName}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5 capitalize">{item.variantInfo || 'N/A'}</p>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-on-surface-variant font-medium">Qty: {item.quantity}</span>
                        <span className="font-mono font-bold text-black">${Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary & Actions */}
            <div className="mt-6 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Payment Summary */}
              <div className="text-xs font-semibold text-on-surface-variant space-y-1">
                <div className="flex gap-3">
                  <span>Payment Method:</span>
                  <span className="text-black uppercase font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex gap-3 text-sm pt-0.5">
                  <span>Total Amount:</span>
                  <span className="text-black font-mono font-black">${Number(order.finalPrice).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {order.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={isCancelling === order.id}
                    onClick={() => handleCancelOrder(order.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{isCancelling === order.id ? 'Cancelling...' : 'Cancel Order'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const addr = order.shippingAddress as any;
                    showToast(
                      `Recipient: ${addr.fullName} | Phone: ${addr.phone} | Address: ${addr.street}, ${addr.ward || ''}, ${addr.province}`,
                      'info'
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline-variant/30 text-on-surface-variant hover:text-black hover:border-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Shipping Address</span>
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
