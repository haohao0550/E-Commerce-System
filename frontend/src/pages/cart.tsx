/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Truck,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Wallet,
  QrCode,
  MapPin,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X
} from 'lucide-react';
import { PageLoader } from '@/components/common/PageLoader';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useAddress } from '@/context/AddressContext';
import { useCart } from '@/context/CartContext';
import { cartService, CartItem } from '@/services/cart.service';
import { couponService, ValidateCouponResponse } from '@/features/coupons/services/coupon.service';
import { orderService } from '@/features/orders/services/order.service';
import { ROUTES } from '@/routes';
import { formatMoney } from '@/utils/format';

// --- Components ---

export default function CartPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { addresses } = useAddress();
  const { cartItems, isLoading: isLoadingCart, refreshCart } = useCart();

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay' | 'momo'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<ValidateCouponResponse | null>(null);

  const defaultImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop';

  // --- Sync default address when addresses load ---
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses]);

  // --- Quantity & Deletion handlers ---
  const handleUpdateQty = async (id: string, currentQty: number, amount: number, stock: number) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    if (newQty > stock) {
      showToast(`Only ${stock} items available in stock`, 'error');
      return;
    }

    try {
      await cartService.updateCartItem(id, newQty);
      await refreshCart();
    } catch (err: any) {
      showToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await cartService.deleteCartItem(id);
      await refreshCart();
      showToast('Item removed from cart', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const handleApplyCoupon = async () => {
    const trimmedCode = couponCode.trim();
    if (!trimmedCode) {
      setCouponError('Please enter a coupon code');
      setCouponSuccess(null);
      setValidatedCoupon(null);
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const result = await couponService.validateCoupon({ code: trimmedCode, orderValue: subtotal });
      setValidatedCoupon(result);
      setCouponSuccess(`Coupon ${result.coupon.code} applied successfully`);
    } catch (err: any) {
      setValidatedCoupon(null);
      setCouponError(err?.message || 'Failed to apply coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setValidatedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  // --- Summary calculations ---
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
  const shipping = 0;
  const discountAmount = validatedCoupon?.discountAmount ?? 0;
  const total = Math.max(subtotal + shipping - discountAmount, 0);

  const isVnd = subtotal > 10000 || cartItems.some(item => Number(item.variant.price) > 10000);

  useEffect(() => {
    if (validatedCoupon && validatedCoupon.orderValue !== subtotal) {
      setValidatedCoupon(null);
      setCouponError('Cart changed. Please reapply your coupon.');
      setCouponSuccess(null);
    }
  }, [subtotal, validatedCoupon]);

  const formatPrice = (price: number) => {
    if (isVnd) {
      return `${price.toLocaleString('vi-VN')}`;
    }
    return `$${price.toFixed(2)}`;
  };

  // --- Complete Order placement ---
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!selectedAddress) {
      showToast('Please add a shipping address in your profile first', 'error');
      void router.push(ROUTES.profile);
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        paymentMethod: paymentMethod.toUpperCase() as 'COD' | 'VNPAY' | 'MOMO',
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          ward: selectedAddress.ward || undefined,
          province: selectedAddress.province,
        },
        items: cartItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        couponId: validatedCoupon?.coupon.id,
      };

      const newOrder = await orderService.createOrder(orderPayload);

      if (paymentMethod === 'momo') {
        // Use central API store to call MoMo payment creation
        const apiStore = (await import('@/store/apiStore')).useApiStore
        const { callApi } = apiStore.getState()

        const momoResponse = await callApi(`/payment/momo/create/${newOrder.id}`, {
          method: 'POST',
          body: { description: '' },
          auth: true,
        })

        await refreshCart();

        // redirect user to payUrl returned by backend
        if (momoResponse?.data?.payUrl) {
          window.location.href = momoResponse.data.payUrl as string
          return
        }
      }

      setOrderSuccessId(newOrder.id);
      showToast('Order completed successfully!', 'success');

      // Clear the context cart
      await refreshCart();
    } catch (err: any) {
      console.error('Failed to place order:', err);
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoadingCart) {
    return <PageLoader label="Opening your ShopKicks vault..." />;
  }

  // --- GUEST VIEW ---
  if (!user) {
    return (
      <main className="flex-grow flex items-center justify-center py-20 px-6">
        <div className="max-w-md text-center space-y-6">
          <ShoppingBag className="w-16 h-16 mx-auto text-on-surface-variant/20" />
          <h2 className="text-3xl font-display font-black text-black uppercase tracking-tighter">Your Cart</h2>
          <p className="text-on-surface-variant font-medium">Please sign in to view and manage your shopping cart items.</p>
          <Link
            href={`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.cart)}`}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 font-bold uppercase tracking-widest text-xs rounded hover:bg-black/90 transition-all shadow-md active:scale-95 !text-white"
          >
            <span className="text-white">Sign In to Proceed</span>
          </Link>
        </div>
      </main>
    );
  }

  // --- SUCCESS VIEW ---
  if (orderSuccessId) {
    return (
      <main className="flex-grow flex items-center justify-center py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-outline-variant/20 rounded-3xl p-10 text-center shadow-xl space-y-8"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-black">Order Placed!</h2>
            <p className="text-sm text-on-surface-variant font-medium">Your checkout succeeded and your order is being processed.</p>
          </div>

          <div className="bg-surface-low border border-outline-variant/30 rounded-2xl p-6 text-left text-xs font-mono space-y-3">
            <div className="flex justify-between">
              <span className="text-on-surface-variant font-bold">Order ID:</span>
              <span className="font-black text-black select-all">{orderSuccessId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant font-bold">Status:</span>
              <span className="font-black text-amber-600 uppercase">PENDING PAYMENT</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href={ROUTES.profile}
              className="w-full bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black/90 transition-all text-center block !text-white"
            >
              <span className="text-white">View Order History</span>
            </Link>
            <Link
              href={ROUTES.home}
              className="w-full bg-transparent border border-black/10 py-5 rounded-xl font-bold uppercase tracking-widest text-xs text-on-surface-variant hover:text-black hover:border-black transition-all text-center block"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // --- EMPTY STATE VIEW ---
  if (cartItems.length === 0) {
    return (
      <main className="flex-grow flex items-center justify-center py-20 px-6">
        <div className="max-w-md text-center space-y-6">
          <ShoppingBag className="w-16 h-16 mx-auto text-on-surface-variant/20" />
          <h2 className="text-3xl font-display font-black text-black uppercase tracking-tighter">Your Cart is Empty</h2>
          <p className="text-on-surface-variant font-medium">Browse our catalog to select premium high-performance sneaker models.</p>
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 font-bold uppercase tracking-widest text-xs rounded hover:bg-black/90 transition-all shadow-md active:scale-95 !text-white"
          >
            <span className="text-white">Browse Catalog</span>
          </Link>
        </div>
      </main>
    );
  }

  // --- MAIN CART & CHECKOUT PAGE ---
  return (
    <main className="flex-grow mx-auto w-full max-w-7xl px-6 py-12 md:px-12 selection:bg-black selection:text-white">
      <header className="mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl md:text-5xl font-black uppercase tracking-tight text-black"
        >
          Checkout
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-on-surface-variant text-base font-semibold"
        >
          Complete your order below.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Shipping & Payment */}
        <div className="lg:col-span-7 space-y-10">

          {/* 1. Shipping Address */}
          <section className="bg-surface-container rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full border border-outline-variant/20 shadow-sm">
                  <Truck className="h-6 w-8 text-black" />
                </div>
                <h2 className="font-heading text-xl font-black uppercase tracking-tight text-black">1. Shipping Address</h2>
              </div>
              {addresses.length > 0 && (
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs font-black uppercase tracking-widest text-black hover:opacity-75 transition-opacity border-b border-black pb-0.5"
                >
                  Change Address
                </button>
              )}
            </div>

            {selectedAddress ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6 text-black">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60">Full Name</span>
                  <p className="text-lg font-bold border-b border-outline-variant/20 pb-2">{selectedAddress.fullName}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60">Street Address</span>
                  <p className="text-lg font-bold border-b border-outline-variant/20 pb-2">{selectedAddress.street}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60">Province / City</span>
                  <p className="text-lg font-bold border-b border-outline-variant/20 pb-2">{selectedAddress.province}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60">Phone Number</span>
                  <p className="text-lg font-bold border-b border-outline-variant/20 pb-2">{selectedAddress.phone}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <MapPin className="w-12 h-12 mx-auto text-on-surface-variant/20 animate-bounce" />
                <p className="text-sm font-bold text-on-surface-variant">No shipping addresses found in your profile.</p>
                <Link
                  href={ROUTES.profile}
                  className="inline-flex bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded hover:bg-black/90 transition-all shadow"
                >
                  Configure Saved Address
                </Link>
              </div>
            )}
          </section>

          {/* 2. Payment Method */}
          <section className="bg-surface-container rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full border border-outline-variant/20 shadow-sm">
                <CreditCard className="h-6 w-8 text-black" />
              </div>
              <h2 className="font-heading text-xl font-black uppercase tracking-tight text-black">2. Payment Method</h2>
            </div>

            <div className="space-y-4">
              {[
                { id: 'cod', label: 'Cash on Delivery (COD)', icon: Wallet },
                { id: 'momo', label: 'MOMO e-Wallet', icon: QrCode },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPaymentMethod(item.id as any)}
                  className={`w-full group relative flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${paymentMethod === item.id
                      ? 'border-black bg-white ring-4 ring-black/5'
                      : 'border-outline-variant/20 bg-surface/50 hover:bg-white hover:border-outline-variant'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === item.id ? 'border-black' : 'border-outline-variant'
                      }`}>
                      {paymentMethod === item.id && <div className="h-3 w-3 rounded-full bg-black" />}
                    </div>
                    <span className={`text-lg font-bold transition-colors ${paymentMethod === item.id ? 'text-black' : 'text-on-surface-variant'
                      }`}>
                      {item.label}
                    </span>
                  </div>
                  <item.icon className={`h-6 w-6 text-black transition-opacity ${paymentMethod === item.id ? 'opacity-100' : 'opacity-40'
                    }`} />
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Cart Items */}
        <aside className="lg:col-span-5">
          <div className="sticky top-32 bg-surface-container rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
            <h2 className="font-heading text-xl font-black uppercase tracking-tight text-black mb-8 border-b border-outline-variant/20 pb-6 flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-black" />
              Order Summary
            </h2>

            {/* Live Database Items List */}
            <div className="space-y-6 mb-10 max-h-[350px] overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => {
                  const imageUrl = item.variant.product.images?.[0] || defaultImage;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      exit={{ opacity: 0, x: -30 }}
                      className="flex gap-4 group border-b border-outline-variant/10 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="h-20 w-20 rounded-xl bg-surface overflow-hidden shrink-0 border border-outline-variant/10">
                        <img
                          src={imageUrl}
                          alt={item.variant.product.name}
                          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-center">
                        <h3 className="font-bold text-base leading-tight uppercase tracking-tight text-black">{item.variant.product.name}</h3>
                        <p className="text-xs font-bold text-on-surface-variant opacity-60 uppercase mt-1 tracking-widest">
                          Color: {item.variant.color || 'Default'} | Size: US {item.variant.size || 'N/A'}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity, -1, item.variant.stock)}
                            className="w-6 h-6 rounded-md border border-outline-variant/30 flex items-center justify-center font-bold text-xs hover:border-black transition-colors cursor-pointer"
                          >
                            −
                          </button>
                          <span className="font-mono text-xs font-bold text-black w-6 text-center select-none">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity, 1, item.variant.stock)}
                            className="w-6 h-6 rounded-md border border-outline-variant/30 flex items-center justify-center font-bold text-xs hover:border-black transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between py-1 shrink-0">
                        <span className="font-heading font-bold text-base text-black font-mono">
                          {formatMoney(Number(item.variant.price) * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-on-surface-variant hover:text-red-600 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Coupon */}
            <div className="space-y-4 mb-6">
              <div className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Have a coupon?</div>
              <div className="flex gap-3">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-xl border border-outline-variant/60 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || subtotal === 0}
                  className={`rounded-xl px-5 py-3 text-sm font-black uppercase tracking-widest transition-all ${isValidatingCoupon || subtotal === 0
                    ? 'bg-outline/50 text-on-surface-variant cursor-not-allowed'
                    : 'bg-black text-white hover:bg-black/90'
                  }`}
                >
                  {isValidatingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>

              {couponError && (
                <p className="text-sm text-red-600 font-medium">{couponError}</p>
              )}

              {couponSuccess && !couponError && (
                <p className="text-sm text-emerald-600 font-medium">{couponSuccess}</p>
              )}

              {validatedCoupon && (
                <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold uppercase tracking-widest mt-1">{validatedCoupon.coupon.code}</p>
                      <p className="text-sm text-emerald-800 mt-1">Discount applied to order</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] font-black bg-red-600 text-white uppercase tracking-widest px-3 py-1 rounded hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex justify-between text-sm">
                    <span>Discount</span>
                    <span className="font-bold font-heading">{formatMoney(validatedCoupon.discountAmount)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-4 pt-8 border-t border-outline-variant/20">
              <div className="flex justify-between text-on-surface-variant">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Subtotal</span>
                <span className="font-heading font-bold text-black font-mono">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant items-center">
                <span className="font-bold text-emerald-600 uppercase tracking-widest text-xs font-sans">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-6 mt-4 border-t border-outline-variant/25">
                <span className="font-heading text-2xl font-black uppercase text-black">Total</span>
                <span className="font-heading text-2xl font-black text-black font-mono">{formatMoney(total)}</span>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || cartItems.length === 0 || !selectedAddress}
              className={`w-full mt-10 text-white py-6 rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-md ${isPlacingOrder || cartItems.length === 0 || !selectedAddress
                  ? 'bg-outline/50 cursor-not-allowed opacity-50 shadow-none'
                  : 'bg-black hover:shadow-xl hover:shadow-black/10'
                }`}
            >
              {isPlacingOrder ? 'Processing...' : 'Complete Order'}
              <ArrowRight className="h-5 w-5" />
            </motion.button>

            {/* Trust Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 opacity-40">
              <ShieldCheck className="h-4 w-4 text-black" />
              Payments are secure and encrypted
            </div>
          </div>
        </aside>
      </div>

      {/* Address Selection Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-outline-variant/30 text-black"
            >
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <X className="w-6 h-6 text-black" />
              </button>

              <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-black mb-6">Select Shipping Address</h3>

              <div className="space-y-4">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setIsAddressModalOpen(false);
                    }}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex flex-col gap-2 ${selectedAddress?.id === addr.id
                        ? 'border-black bg-surface-container-low shadow-md'
                        : 'border-outline-variant/20 hover:border-outline-variant/60 hover:bg-surface-container-low/55'
                      }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-base text-black">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="bg-black text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest font-sans">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant font-medium">{addr.street}, {addr.ward ? `${addr.ward}, ` : ''}{addr.province}</p>
                    <span className="text-xs font-mono text-on-surface-variant font-bold">{addr.phone}</span>
                  </button>
                ))}

                <Link
                  href={ROUTES.profile}
                  className="w-full text-center py-4 border-2 border-dashed border-outline-variant/30 rounded-2xl text-xs font-black uppercase tracking-widest text-on-surface-variant hover:border-black hover:text-black transition-colors block mt-4"
                >
                  + Add / Manage Addresses
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
