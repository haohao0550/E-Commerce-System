import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ChevronLeft,
  ShoppingCart,
  Check,
  AlertTriangle,
  Info,
  Heart,
  ChevronDown,
  Truck,
  RotateCcw,
  ShieldCheck,
  X,
  CreditCard,
  QrCode,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader } from '@/components/common/PageLoader';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useAddress } from '@/context/AddressContext';
import { useCart } from '@/context/CartContext';
import { productService } from '@/features/products/services/product.service';
import { orderService } from '@/features/orders/services/order.service';
import { cartService } from '@/services/cart.service';
import { ReviewSection } from '@/features/reviews/components/ReviewSection';
import type { Product, ProductVariant } from '@/features/products/types/product';
import { ROUTES } from '@/routes';
import { formatMoney } from '@/utils/format';

export default function UserProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();
  const { user } = useAuth();
  const { addresses } = useAddress();
  const { refreshCart } = useCart();

  // --- States ---
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Checkout Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY' | 'MOMO'>('COD');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Accordion active sections
  const [expandedSection, setExpandedSection] = useState<'desc' | 'shipping' | null>('desc');

  const defaultImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop';

  // --- Auto-fill User details when Checkout opens ---
  useEffect(() => {
    if (isCheckoutOpen && user) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddress) {
        setFullName(defaultAddress.fullName);
        setPhone(defaultAddress.phone);
        setProvince(defaultAddress.province);
        setWard(defaultAddress.ward || '');
        setStreet(defaultAddress.street);
      } else {
        setFullName(user.name || '');
        setPhone(user.phone || '');
      }
    }
  }, [isCheckoutOpen, user, addresses]);

  // --- Fetch Product Detail ---
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);

        // Initialize default variant selections if variants exist
        if (data.variants && data.variants.length > 0) {
          const initialVariant = data.variants.find(v => v.stock > 0) || data.variants[0];
          setSelectedVariant(initialVariant);
          setSelectedColor(initialVariant.color || '');
          setSelectedSize(initialVariant.size || '');
        }
      } catch (err: any) {
        console.error('Error fetching product details:', err);
        showToast(err.message || 'Failed to load product details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProduct();
  }, [id, showToast]);

  // --- Update Selected Variant on Color or Size Change ---
  useEffect(() => {
    if (!product || !product.variants) return;

    const match = product.variants.find(
      (v) => (v.color || '') === selectedColor && (v.size || '') === selectedSize
    );

    if (match) {
      setSelectedVariant(match);
      // Reset quantity if it exceeds new variant's stock
      if (quantity > match.stock) {
        setQuantity(match.stock > 0 ? 1 : 0);
      }
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize, product]);

  if (isLoading) {
    return <PageLoader label="Fetching sneaker details..." />;
  }

  if (!product) {
    return (
      <main className="mx-auto px-6 md:px-10 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-3xl font-display font-black text-black uppercase tracking-tighter">Sneaker Not Found</h2>
          <p className="text-on-surface-variant font-medium">The product you are trying to view does not exist or has been retired from our catalog.</p>
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 font-bold uppercase tracking-widest text-xs rounded hover:bg-black/90 transition-all shadow-md active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </main>
    );
  }

  const variants = product.variants || [];
  const images = product.images && product.images.length > 0 ? product.images : [defaultImage];

  // Group unique colors and sizes for selector
  const uniqueColors = Array.from(new Set(variants.map((v) => v.color || ''))).filter(Boolean);
  const uniqueSizes = Array.from(new Set(variants.map((v) => v.size || ''))).filter(Boolean);

  // Active Price based on selected variant, falling back to base price
  const displayPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
  const displayStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = variants.length > 0 && (!selectedVariant || displayStock === 0);

  // --- Handlers ---
  const handleAddToCart = async () => {
    if (isOutOfStock || !selectedVariant) return;

    if (!user) {
      showToast('Please sign in to add items to your cart', 'info');
      void router.push(`${ROUTES.login}?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartService.addToCart(selectedVariant.id, quantity);
      await refreshCart();
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      showToast(err.message || 'Failed to add item to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    if (!user) {
      showToast('Please sign in to proceed with checkout', 'info');
      void router.push(`${ROUTES.login}?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (!selectedVariant) {
      showToast('Please select a colorway and sizing', 'info');
      return;
    }

    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // --- Validation following Zod Backend rules ---
    if (!fullName || fullName.trim().length < 2) {
      setFormError('Full name must be at least 2 characters');
      return;
    }
    if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
      setFormError('Phone number must be exactly 10 or 11 numeric digits');
      return;
    }
    if (!street || street.trim().length < 5) {
      setFormError('Street address must be at least 5 characters');
      return;
    }
    if (!province || province.trim().length < 2) {
      setFormError('Please specify a valid province or city');
      return;
    }

    if (!selectedVariant) return;

    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        paymentMethod: paymentMethod.toUpperCase() as 'COD' | 'VNPAY' | 'MOMO',
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          street: street.trim(),
          ward: ward.trim() || undefined,
          province: province.trim(),
        },
        note: note.trim() || undefined,
        items: [
          {
            variantId: selectedVariant.id,
            quantity,
          }
        ]
      };

      const newOrder = await orderService.createOrder(orderPayload);

      if (paymentMethod === 'MOMO') {
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
      showToast('Order created successfully! Awaiting payment.', 'success');

      // Update local product variant stock count dynamically to represent actual DB reduction
      setProduct((prev) => {
        if (!prev || !prev.variants) return prev;
        return {
          ...prev,
          variants: prev.variants.map((v) => {
            if (v.id === selectedVariant.id) {
              return { ...v, stock: Math.max(0, v.stock - quantity) };
            }
            return v;
          })
        };
      });
    } catch (err: any) {
      console.error('Order checkout creation failed:', err);
      setFormError(err.message || 'An error occurred while placing your order. Please try again.');
      showToast(err.message || 'Checkout failed', 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    showToast(
      isWishlisted ? 'Removed product from your wishlist' : 'Added product to your wishlist!',
      isWishlisted ? 'info' : 'success'
    );
  };

  const adjustQuantity = (amount: number) => {
    const newQty = quantity + amount;
    const maxStock = selectedVariant ? selectedVariant.stock : 99;
    if (newQty >= 1 && newQty <= maxStock) {
      setQuantity(newQty);
    }
  };

  return (
    <div className="bg-surface-lowest min-h-screen font-sans selection:bg-black selection:text-white relative overflow-x-hidden">
      {/* Breadcrumbs / Back Bar */}
      <div className="mx-auto px-6 md:px-10 py-6">
        <Link
          href={ROUTES.home}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-black transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Collection</span>
        </Link>
      </div>

      {/* Main Workspace Catalog View */}
      <main className="mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Column: Premium Gallery Showcase */}
          <section className="lg:col-span-7 space-y-2">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-low border border-outline-variant/10">
              <img
                src={images[activeImageIndex]}
                alt={`${product.name} Preview`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Pulse Active Badges */}
              {!product.isDeleted && (
                <span className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Available</span>
                </span>
              )}
            </div>

            {/* Gallery Thumbnails List */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${activeImageIndex === index
                        ? 'border-black scale-95 shadow'
                        : 'border-outline-variant/20 hover:border-black/50'
                      }`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Premium Purchase Interface */}
          <section className="lg:col-span-5 flex flex-col justify-start space-y-8">

            {/* Sneaker Brand & Header details */}
            <header className="space-y-3">
              <span className="text-base font-semibold uppercase tracking-[0.25em] text-gray-600">
                Premium Footwear
              </span>
              <h3 className="text-4xl md:text-4xl font-display font-black text-black tracking-tight uppercase leading-[0.95] mt-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-4 pt-1">
                <p className="text-3xl font-display font-black text-black tracking-tight font-mono">
                  {formatMoney(displayPrice)}
                </p>

                {/* Active Variant Badges */}
                {selectedVariant && (
                  <span className="text-sm font-bold text-on-surface-variant font-mono bg-surface-container px-2.5 py-1 rounded border border-outline-variant/10 mt-1">
                    SKU: {selectedVariant.sku}
                  </span>
                )}
              </div>
            </header>

            {/* Dynamic Interactive Variant Selectors */}
            {variants.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-outline-variant/20">

                {/* Color Selector */}
                {uniqueColors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-black">
                      <span>Colorways</span>
                      <span className="text-on-surface-variant font-medium capitalize">{selectedColor || 'Select Color'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {uniqueColors.map((color) => {
                        const isActive = selectedColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              const sizesForColor = variants
                                .filter(v => (v.color || '') === color)
                                .map(v => v.size || '');
                              if (sizesForColor.length === 1) {
                                setSelectedSize(sizesForColor[0]);
                              }
                            }}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-full transition-all cursor-pointer ${isActive
                                ? 'bg-black text-white border-black font-extrabold shadow-sm'
                                : 'bg-white text-on-surface-variant border-outline-variant/30 hover:border-black/50'
                              }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {uniqueSizes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-black">
                      <span>Sizing (US Men)</span>
                      <span className="text-on-surface-variant font-medium">US {selectedSize || 'Select Size'}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {uniqueSizes.map((size) => {
                        const isActive = selectedSize === size;
                        const isAvailableInColor = variants.some(
                          (v) => (v.color || '') === selectedColor && (v.size || '') === size && v.stock > 0
                        );

                        return (
                          <button
                            key={size}
                            disabled={!isAvailableInColor && selectedColor !== ''}
                            onClick={() => setSelectedSize(size)}
                            className={`py-3 text-xs font-bold font-mono border rounded-lg transition-all cursor-pointer ${isActive
                                ? 'bg-black text-white border-black font-extrabold'
                                : isAvailableInColor || selectedColor === ''
                                  ? 'bg-white text-black border-outline-variant/30 hover:border-black/50'
                                  : 'bg-surface-low text-on-surface-variant/40 border-outline-variant/10 cursor-not-allowed opacity-50'
                              }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inventory Status Bar */}
            <div className="pt-2">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50/50 border border-red-100 p-4 rounded-xl text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Out of stock</span>
                </div>
              ) : selectedVariant && displayStock < 5 ? (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-sm font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Only {displayStock} left</span>
                </div>
              ) : selectedVariant ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-xs font-bold uppercase tracking-wider">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Stock: {displayStock}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-on-surface-variant bg-surface-low border border-outline-variant/10 p-4 rounded-xl text-xs font-semibold">
                  <Info className="w-4 h-4 shrink-0 text-primary" />
                  <span>Select variant to view stock</span>
                </div>
              )}
            </div>

            {/* Interactive Quantity & Add to Cart Core controls */}
            <div className="flex flex-col gap-4 pt-6 border-t border-outline-variant/20">

              <div className="flex gap-4">
                {/* Quantity Selector */}
                {!isOutOfStock && selectedVariant && (
                  <div className="flex items-center border border-outline-variant/30 rounded-xl bg-white shadow-sm overflow-hidden h-14 shrink-0">
                    <button
                      type="button"
                      onClick={() => adjustQuantity(-1)}
                      className="px-4 text-lg font-bold text-on-surface-variant hover:text-black transition-colors"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-bold text-black select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustQuantity(1)}
                      className="px-4 text-lg font-bold text-on-surface-variant hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  type="button"
                  disabled={isOutOfStock || isAddingToCart}
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 h-14 border rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-98 cursor-pointer ${isOutOfStock
                      ? 'bg-surface-high text-on-surface-variant/40 border border-outline-variant/10 cursor-not-allowed shadow-none'
                      : 'bg-white text-black border-black hover:bg-surface-low'
                    }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isAddingToCart ? 'Injecting...' : 'Add to Cart'}</span>
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={toggleWishlist}
                  className={`w-14 h-14 border rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer ${isWishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                      : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-black/50 hover:text-black'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Direct Buy Now checkout button */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`w-full flex items-center justify-center gap-2 h-14 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-md active:scale-98 cursor-pointer ${isOutOfStock
                    ? 'bg-surface-high text-on-surface-variant/40 border border-outline-variant/10 cursor-not-allowed shadow-none'
                    : 'bg-black text-white hover:bg-black/90 hover:shadow-lg'
                  }`}
              >
                <span>Direct Checkout (Buy Now)</span>
              </button>

            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-xs font-black uppercase tracking-wider text-on-surface-variant/60">
              <div className="flex flex-col items-center text-center gap-2 p-3 bg-surface-low rounded-xl border border-outline-variant/5">
                <Truck className="w-8 h-8 text-black" />
                <span>Free Express</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 bg-surface-low rounded-xl border border-outline-variant/5">
                <RotateCcw className="w-8 h-8 text-black" />
                <span>30-Day returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 bg-surface-low rounded-xl border border-outline-variant/5">
                <ShieldCheck className="w-8 h-8 text-black" />
                <span>100% Authentic</span>
              </div>
            </div>

            {/* Accordion Specification Panels */}
            <div className="pt-6 border-t border-outline-variant/20 space-y-2">

              {/* Description Panel */}
              <div className="border border-outline-variant/20 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'desc' ? null : 'desc')}
                  className="w-full flex items-center justify-between px-5 py-4 font-bold text-sm uppercase tracking-wider text-black hover:bg-surface-low/30 transition-colors"
                >
                  <span className="text-base font-semibold">Description</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedSection === 'desc' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {expandedSection === 'desc' && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed font-medium">
                        {product.description || 'No specialized description provided for this premium sneaker model.'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping & Returns Panel */}
              <div className="border border-outline-variant/20 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'shipping' ? null : 'shipping')}
                  className="w-full flex items-center justify-between px-5 py-4 font-bold text-xs uppercase tracking-wider text-black hover:bg-surface-low/30 transition-colors"
                >
                  <span className="text-base font-semibold">Shipping & Returns</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedSection === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {expandedSection === 'shipping' && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed font-medium space-y-2">
                        <p>📦 <strong>Standard Ground:</strong> Free delivery on all orders above $100. Fulfilled in 3-5 business days.</p>
                        <p>🚀 <strong>Express Courier:</strong> Overnight dispatch available at checkout for a flat-fee of $15.</p>
                        <p>🔄 <strong>No-Hassle Returns:</strong> Return requests accepted inside 30 days from dispatch date. Sneakers must remain completely unworn with tag wrappers intact.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </section>
        </div>
          {/* ✅ Full-width, dưới grid */}
        <div className="mt-20 pt-16 border-t border-outline-variant/20">
          {product && <ReviewSection productId={product.id} productName={product.name} productImage={product.images?.[0]} />}
        </div>
      </main>

      {/* --- PREMIUM CHEKOUT SLIDE-OVER DRAWER --- */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmittingOrder) setIsCheckoutOpen(false);
              }}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Slide-over Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden text-black font-sans"
            >
              {/* Header */}
              <header className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-low">
                <div>
                  <h3 className="text-3xl font-display font-black uppercase tracking-tight">Checkout Drawer</h3>
                  <p className="text-base text-on-surface-variant font-semibold mt-2">Verify details & complete your order</p>
                </div>
                <button
                  type="button"
                  disabled={isSubmittingOrder}
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-2 text-on-surface-variant hover:text-black disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {orderSuccessId ? (
                  // --- SUCCESS STATE PANEL ---
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-display font-black uppercase">Order Placed!</h4>
                      <p className="text-sm text-on-surface-variant font-medium">Your checkout succeeded and is awaiting processing.</p>
                    </div>

                    <div className="bg-surface-low border border-outline-variant/30 rounded-xl p-5 text-left text-xs font-mono space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Order Reference:</span>
                        <span className="font-bold text-black select-all">{orderSuccessId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Status:</span>
                        <span className="font-bold text-amber-600 uppercase">AWAITING PAYMENT (PENDING)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Total Price:</span>
                        <span className="font-bold text-black">${(displayPrice * quantity).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                      <Link
                        href={ROUTES.profile}
                        onClick={() => setIsCheckoutOpen(false)}
                        className="w-full bg-black text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black/90 transition-all text-center block"
                      >
                        View Order History
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderSuccessId(null);
                          setIsCheckoutOpen(false);
                        }}
                        className="w-full bg-transparent border border-black/10 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs text-on-surface-variant hover:text-black hover:border-black transition-all text-center"
                      >
                        Back to Product
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // --- CHECKOUT FORM STATE ---
                  <form onSubmit={handlePlaceOrder} className="space-y-6">

                    {/* Item Card Review */}
                    <div className="flex gap-4 p-4 bg-surface-low border border-outline-variant/10 rounded-xl">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-outline-variant/10 flex-shrink-0">
                        <img src={images[0]} alt={product.name} className="w-24 h-16 object-cover" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-bold text-black uppercase truncate">{product.name}</p>
                        <p className="text-on-surface-variant font-medium mt-0.5 capitalize">Color: {selectedColor} | Size: US {selectedSize}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-on-surface-variant font-medium">Qty: {quantity}</span>
                          <span className="font-mono font-bold text-black">{formatMoney(displayPrice * quantity)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address Header */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-wider text-black border-b border-outline-variant/20 pb-2">
                        1. Shipping Address
                      </h4>

                      {addresses.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Use Saved Address</label>
                          <select
                            onChange={(e) => {
                              const selected = addresses.find((a) => a.id === e.target.value);
                              if (selected) {
                                setFullName(selected.fullName);
                                setPhone(selected.phone);
                                setProvince(selected.province);
                                setWard(selected.ward || '');
                                setStreet(selected.street);
                              }
                            }}
                            className="w-full border border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black mt-2"
                          >
                            <option value="">-- Select a saved address --</option>
                            {addresses.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.fullName} - {a.street}, {a.province} {a.isDefault ? '(Default)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border mt-1 border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="0912345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border mt-1 border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Province/City *</label>
                          <input
                            type="text"
                            required
                            placeholder="Hồ Chí Minh"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className="w-full border mt-1 border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Ward</label>
                          <input
                            type="text"
                            placeholder="Phường Bến Nghé"
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            className="w-full border mt-1 border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Street Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="123 Nguyễn Huệ, Lầu 3"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full border mt-1 border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black"
                        />
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-black uppercase tracking-wider text-black border-b border-outline-variant/20 pb-2">
                        2. Payment Method
                      </h4>

                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('COD')}
                          className={`flex flex-col items-center justify-center p-3 border rounded-sm gap-1.5 transition-all cursor-pointer ${paymentMethod === 'COD'
                              ? 'border-black bg-black/5 font-bold shadow-sm'
                              : 'border-outline-variant/20 hover:border-black/50'
                            }`}
                        >
                          <DollarSign className="w-6 h-6 text-black" />
                          <span className="text-xs uppercase">COD</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('MOMO')}
                          className={`flex flex-col items-center justify-center p-3 border rounded-sm gap-1.5 transition-all cursor-pointer ${paymentMethod === 'MOMO'
                              ? 'border-pink-600 bg-pink-50 font-bold shadow-sm'
                              : 'border-outline-variant/30 hover:border-black/50'
                            }`}
                        >
                          <QrCode className="w-6 h-6 text-pink-600" />
                          <span className="text-xs uppercase text-pink-600">MOMO</span>
                        </button>
                      </div>
                    </div>

                    {/* Optional Checkout Note */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Order Note (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Deliver inside office hours only, please."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full mt-1 border border-outline-variant/40 rounded-lg px-3 py-2 text-sm bg-surface-lowest focus:outline-none focus:border-black font-semibold text-black resize-none"
                      />
                    </div>

                    {/* Form validation alert */}
                    {formError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Pricing Summary */}
                    <div className="pt-4 border-t border-outline-variant/20 space-y-2 text-xs font-semibold text-on-surface-variant">
                      <div className="flex justify-between text-sm">
                        <span>Items Subtotal</span>
                        <span className="text-black font-mono mt-2">{formatMoney(displayPrice * quantity)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping Courier Fee</span>
                        <span className="text-black font-bold uppercase">FREE</span>
                      </div>
                      <div className="flex justify-between pt-2 text-sm font-black text-black border-t border-dashed border-outline-variant/20">
                        <span>Final Price</span>
                        <span className="font-mono text-base">{formatMoney(displayPrice * quantity)}</span>
                      </div>
                    </div>

                    {/* Submit checkout button */}
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full flex items-center justify-center gap-2 h-14 bg-black text-white hover:bg-black/90 font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all active:scale-98 disabled:bg-surface-high disabled:text-on-surface-variant/40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmittingOrder ? (
                        <span>Securing Sneaker...</span>
                      ) : (
                        <span>Confirm & Place Order</span>
                      )}
                    </button>

                  </form>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}} />
    </div>
  );
}
