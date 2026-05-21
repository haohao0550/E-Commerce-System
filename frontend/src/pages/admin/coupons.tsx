import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageLoader } from '@/components/common/PageLoader';
import { Sidebar } from '@/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { adminCouponService } from '@/features/coupons/services/admin-coupon.service';
import { ROUTES } from '@/routes';
import type { Coupon, CreateCouponPayload } from '@/types/coupon';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminCouponsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const couponsPerPage = 10;

  const formatCurrency = (value: number) => {
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value)} vnđ`;
  };

  const resetForm = () => {
    setCode('');
    setDiscount('');
    setMinOrderValue('');
    setMaxDiscount('');
    setUsageLimit('');
    setIsActive(true);
    setExpiresAt('');
  };

  const fetchCoupons = useCallback(async () => {
    setIsLoadingCoupons(true);
    try {
      const data = await adminCouponService.getCoupons({ page: currentPage, limit: couponsPerPage });
      setCoupons(data.coupons || []);
      setTotalCoupons(data.pagination?.total || data.coupons.length || 0);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      showToast('Failed to load coupons', 'error');
    } finally {
      setIsLoadingCoupons(false);
    }
  }, [currentPage, showToast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      void fetchCoupons();
    }
  }, [fetchCoupons, user?.role]);

  const openCreateModal = () => {
    resetForm();
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscount(String(coupon.discount));
    setMinOrderValue(coupon.minOrderValue ? String(coupon.minOrderValue) : '');
    setMaxDiscount(coupon.maxDiscount ? String(coupon.maxDiscount) : '');
    setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : '');
    setIsActive(coupon.isActive);
    setExpiresAt(coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) {
      showToast('Coupon code is required', 'error');
      return;
    }

    const discountNumber = Number(discount);
    if (Number.isNaN(discountNumber) || discountNumber <= 0) {
      showToast('Discount must be a valid number', 'error');
      return;
    }

    const payload: CreateCouponPayload = {
      code: code.trim(),
      discount: discountNumber,
      minOrderValue: minOrderValue ? Number(minOrderValue) : null,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    try {
      setIsSubmitting(true);
      if (editingCoupon) {
        const updated = await adminCouponService.updateCoupon(editingCoupon.id, payload);
        setCoupons((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showToast('Coupon updated successfully', 'success');
      } else {
        const created = await adminCouponService.createCoupon(payload);
        setCoupons((prev) => [created, ...prev]);
        setTotalCoupons((prev) => prev + 1);
        showToast('Coupon created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving coupon:', err);
      showToast('Failed to save coupon', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await adminCouponService.deleteCoupon(coupon.id);
      setCoupons((prev) => prev.filter((item) => item.id !== coupon.id));
      setTotalCoupons((prev) => Math.max(prev - 1, 0));
      showToast('Coupon deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting coupon:', err);
      showToast('Failed to delete coupon', 'error');
    }
  };

  if (isAuthLoading) {
    return <PageLoader label="Validating administrator session" />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="page-title text-red-600">Admin access required</h1>
        <p className="page-subtitle text-center">Please authenticate with an admin account to manage coupons.</p>
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
            <h2 className="text-5xl font-display font-black text-on-surface tracking-tighter">Coupons</h2>
            <p className="text-lg text-on-surface-variant">Create discount rules and manage expiration windows.</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-brand-primary text-brand-on-primary px-6 py-3 rounded-2xl font-bold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Coupon</span>
          </motion.button>
        </header>

        {isLoadingCoupons ? (
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
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 bg-white border border-surface-container-highest rounded-2xl shadow-xl p-8">
            <p className="text-xl font-bold text-on-surface mb-2 uppercase tracking-wide">No Coupons Found</p>
            <p className="text-sm text-on-surface-variant/70 font-medium">Create a coupon to get started.</p>
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
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Code</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Discount</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Usage</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Max Discount</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Active</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest">Expires</th>
                    <th className="py-5 px-6 text-xs uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-surface-base/50 transition-colors">
                      <td className="py-5 px-6">
                        <p className="text-sm font-bold text-on-surface">{coupon.code}</p>
                        <p className="text-xs text-on-surface-variant">Min order: {coupon.minOrderValue ?? '—'}</p>
                      </td>
                      <td className="py-5 px-6 text-sm font-bold text-on-surface">{coupon.discount}%</td>
                      <td className="py-5 px-6 text-sm text-on-surface-variant">
                        {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                      </td>
                      <td className="py-5 px-6 text-sm text-on-surface-variant">
                        {coupon.maxDiscount == null ? '—' : formatCurrency(coupon.maxDiscount)}
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${coupon.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm text-on-surface-variant">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-US') : 'No expiry'}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(coupon)}
                            className="p-2.5 text-on-surface-variant hover:text-brand-primary hover:bg-surface-container rounded-xl transition-all active:scale-90"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon)}
                            className="p-2.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-on-surface">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface">Code</label>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface">Discount (%)</label>
                <input
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value.replace(/\D/g, ''))}
                  className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-on-surface">Min Order Value</label>
                  <input
                    value={minOrderValue}
                    onChange={(event) => setMinOrderValue(event.target.value.replace(/\D/g, ''))}
                    className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface">Max Discount</label>
                  <input
                    value={maxDiscount}
                    onChange={(event) => setMaxDiscount(event.target.value.replace(/\D/g, ''))}
                    className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-on-surface">Usage Limit</label>
                  <input
                    value={usageLimit}
                    onChange={(event) => setUsageLimit(event.target.value.replace(/\D/g, ''))}
                    className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface">Expires At</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
                <span className="text-sm text-on-surface">Active</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-brand-on-primary"
                >
                  {isSubmitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
