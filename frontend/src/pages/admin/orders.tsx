import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageLoader } from '@/components/common/PageLoader';
import { Sidebar } from '@/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { adminOrderService } from '@/features/orders/services/admin-order.service';
import { ROUTES } from '@/routes';
import type { Order } from '@/features/orders/services/order.service';
import { Calendar, Eye, PackageSearch, RefreshCw, ChevronDown, X } from 'lucide-react';
import { motion } from 'motion/react';

const statusOptions: Order['status'][] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const paymentStatusOptions: Order['paymentStatus'][] = ['UNPAID', 'PAID', 'FAILED', 'REFUNDED'];

export default function AdminOrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<Order['paymentStatus'] | ''>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const ordersPerPage = 10;

  const formatCurrency = (value: number) => {
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value)} vnđ`;
  };

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const response = await adminOrderService.getOrders({
        page: currentPage,
        limit: ordersPerPage,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
      });
      setOrders(response.orders);
      setTotalOrders(response.total);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [currentPage, paymentFilter, showToast, statusFilter]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      void fetchOrders();
    }
  }, [fetchOrders, user?.role]);

  const openOrderDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsLoadingDetail(true);
    try {
      const order = await adminOrderService.getOrderById(orderId);
      setSelectedOrder(order);
      setOriginalOrder(order);
    } catch (err) {
      console.error('Error fetching order detail:', err);
      showToast('Failed to load order detail', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setOriginalOrder(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !originalOrder) return;
    try {
      setUpdatingStatus(true);
      let updated = selectedOrder;
      
      // Only call updateOrderStatus if status changed
      if (selectedOrder.status !== originalOrder.status) {
        updated = await adminOrderService.updateOrderStatus(selectedOrder.id, selectedOrder.status);
      }
      
      // Only call updatePaymentStatus if paymentStatus changed
      if (selectedOrder.paymentStatus !== originalOrder.paymentStatus) {
        updated = await adminOrderService.updatePaymentStatus(updated.id, selectedOrder.paymentStatus);
      }
      
      // If nothing changed, show info message
      if (selectedOrder.status === originalOrder.status && selectedOrder.paymentStatus === originalOrder.paymentStatus) {
        showToast('No changes made', 'info');
        setUpdatingStatus(false);
        return;
      }
      
      setSelectedOrder(updated);
      setOriginalOrder(updated);
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      showToast('Order updated successfully', 'success');
    } catch (err) {
      console.error('Error updating order:', err);
      showToast('Failed to update order', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const summary = useMemo(() => ({
    total: totalOrders,
    pending: orders.filter((order) => order.status === 'PENDING').length,
    paid: orders.filter((order) => order.paymentStatus === 'PAID').length,
  }), [orders, totalOrders]);

  if (isAuthLoading) {
    return <PageLoader label="Validating administrator session" />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="page-title text-red-600">Admin access required</h1>
        <p className="page-subtitle text-center">Please authenticate with an admin account to manage orders.</p>
        <Link className="pill-link bg-primary text-white" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-base font-sans selection:bg-brand-primary selection:text-brand-on-primary">
      <Sidebar />

      <main className="flex-1 ml-64 p-10 mx-auto w-full">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="text-5xl font-display font-black text-on-surface tracking-tighter">Orders</h2>
            <p className="text-lg text-on-surface-variant">Track fulfillment, payment status, and delivery outcomes.</p>
          </motion.div>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Total Orders</p>
            <p className="text-3xl font-display font-black text-on-surface mt-2">{summary.total}</p>
          </div>
          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Pending</p>
            <p className="text-3xl font-display font-black text-on-surface mt-2">{summary.pending}</p>
          </div>
          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Paid</p>
            <p className="text-3xl font-display font-black text-on-surface mt-2">{summary.paid}</p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-surface-container border border-surface-container-highest rounded-xl p-5 mb-8 flex flex-wrap items-center gap-4 shadow-sm"
        >
          <div className="flex flex-col">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Status</label>
            <div className="relative bg-white border border-surface-container-highest rounded-lg overflow-hidden shadow-sm flex items-center pr-3 mt-2 w-52">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as Order['status'] | '');
                  setCurrentPage(1);
                }}
                className="appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold text-on-surface outline-none cursor-pointer w-full"
              >
                <option value="">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 pointer-events-none w-3.5 h-3.5 opacity-50 text-on-surface" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Payment</label>
            <div className="relative bg-white border border-surface-container-highest rounded-lg overflow-hidden shadow-sm flex items-center pr-3 mt-2 w-52">
              <select
                value={paymentFilter}
                onChange={(event) => {
                  setPaymentFilter(event.target.value as Order['paymentStatus'] | '');
                  setCurrentPage(1);
                }}
                className="appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold text-on-surface outline-none cursor-pointer w-full"
              >
                <option value="">All</option>
                {paymentStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 pointer-events-none w-3.5 h-3.5 opacity-50 text-on-surface" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="ml-auto inline-flex items-center gap-2 bg-brand-primary text-brand-on-primary px-4 py-2 rounded-lg text-sm font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </motion.section>

        {isLoadingOrders ? (
          <div className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-xl animate-pulse">
            <div className="bg-brand-primary h-14 w-full" />
            <div className="divide-y divide-surface-container-high">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-8 flex items-center justify-between gap-6">
                  <div className="h-6 bg-surface-container rounded w-1/3" />
                  <div className="h-6 bg-surface-container rounded w-24" />
                  <div className="h-6 bg-surface-container rounded w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-surface-container-highest rounded-2xl shadow-xl p-8">
            <p className="text-xl font-bold text-on-surface mb-2 uppercase tracking-wide">No Orders Found</p>
            <p className="text-sm text-on-surface-variant/70 font-medium">Try adjusting filters.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black [&>th]:!text-white [&>th]:!font-black">
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">User</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Status</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Payment</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Total</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Created</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-base/50 transition-colors">
                      <td className="py-5 px-6">
                        <p className="text-sm font-bold text-on-surface">{order.user?.name || order.user?.email || 'Unknown'}</p>
                        <p className="text-xs text-on-surface-variant font-mono">{order.user?.email || order.userId}</p>
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-surface-container-high text-on-surface-variant">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-surface-container-high text-on-surface-variant">
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm font-bold text-on-surface">{formatCurrency(order.finalPrice)}</td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => void openOrderDetail(order.id)}
                          className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-on-surface-variant">
          <span>Page {currentPage}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 border border-surface-container-high rounded-lg"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 border border-surface-container-high rounded-lg"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            {isLoadingDetail || !selectedOrder ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                <PackageSearch className="w-8 h-8 mb-3" />
                Loading order details...
              </div>
            ) : (
              <div className="space-y-6">
                <header className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">Order {selectedOrder.id}</h3>
                    <p className="text-sm text-on-surface-variant">Placed {new Date(selectedOrder.createdAt).toLocaleString('en-US')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeOrderDetail}
                    className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Shipping</p>
                    <p className="text-sm font-semibold text-on-surface mt-2">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-sm text-on-surface-variant">{selectedOrder.shippingAddress.phone}</p>
                    <p className="text-sm text-on-surface-variant">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-sm text-on-surface-variant">{selectedOrder.shippingAddress.province}</p>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Payment</p>
                    <p className="text-sm font-semibold text-on-surface">{selectedOrder.paymentMethod}</p>
                    <p className="text-sm text-on-surface-variant">Status: {selectedOrder.paymentStatus}</p>
                    <p className="text-sm text-on-surface-variant">Order total: {formatCurrency(selectedOrder.finalPrice)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Items</p>
                  <div className="mt-3 space-y-3">
                    {(selectedOrder.items || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between border border-surface-container-high rounded-xl p-3">
                        <div>
                          <p className="text-sm font-bold text-on-surface">{item.productName}</p>
                          <p className="text-xs text-on-surface-variant">{item.variantInfo}</p>
                        </div>
                        <div className="text-sm font-semibold text-on-surface">
                          {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Order Status</label>
                    <div className="relative bg-white border border-surface-container-highest rounded-lg overflow-hidden shadow-sm flex items-center pr-3 mt-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(event) => setSelectedOrder({ ...selectedOrder, status: event.target.value as Order['status'] })}
                        className="appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold text-on-surface outline-none cursor-pointer w-full"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 pointer-events-none w-3.5 h-3.5 opacity-50 text-on-surface" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Payment Status</label>
                    <div className="relative bg-white border border-surface-container-highest rounded-lg overflow-hidden shadow-sm flex items-center pr-3 mt-2">
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(event) => setSelectedOrder({ ...selectedOrder, paymentStatus: event.target.value as Order['paymentStatus'] })}
                        className="appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold text-on-surface outline-none cursor-pointer w-full"
                      >
                        {paymentStatusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 pointer-events-none w-3.5 h-3.5 opacity-50 text-on-surface" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => void handleUpdateStatus()}
                  className="w-full bg-brand-primary text-brand-on-primary rounded-xl py-3 text-sm font-extrabold uppercase tracking-wider"
                >
                  {updatingStatus ? 'Updating...' : 'Update Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
