import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Edit, 
  Trash2,
  Layers, 
  Package, 
  Copy, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Tag, 
  Activity,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageLoader } from '@/components/common/PageLoader';
import { Sidebar } from '@/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/features/products/services/product.service';
import { productVariantService } from '@/features/products/services/product-variant.service';
import { ProductVariantModal } from '@/features/products/components/ProductVariantModal';
import { ProductFormModal } from '@/features/products/components/ProductFormModal';
import { categoryService } from '@/features/categories/services/category.service';
import { ROUTES } from '@/routes';
import type { Product, ProductVariant } from '@/features/products/types/product';
import type { Category } from '@/features/categories/types/category';
import { formatMoney } from '@/utils/format';

export default function AdminProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  // --- Page States ---
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  const formatCurrency = formatMoney;

  // --- Fetch Product Detail ---
  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      showToast(err.message || 'Failed to load product details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    void fetchProduct(id);
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    void fetchCategories();
  }, []);

  // --- Copy ID Helper ---
  const handleCopyId = (text: string, type: 'id' | 'sku') => {
    void navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast(`Copied ${type === 'id' ? 'Product UUID' : 'Variant SKU'} to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreateVariant = () => {
    setEditingVariant(null);
    setIsVariantModalOpen(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setIsVariantModalOpen(true);
  };

  const handleVariantSaved = async () => {
    setIsVariantModalOpen(false);
    setEditingVariant(null);
    if (typeof id === 'string') {
      await fetchProduct(id);
    }
  };

  const handleEditProduct = () => {
    if (!product) return;
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    if (!window.confirm(`Delete product ${product.name}?`)) return;
    try {
      await productService.deleteProduct(product.id);
      showToast('Product deleted successfully', 'success');
      router.push(ROUTES.adminProducts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      showToast(message, 'error');
    }
  };

  const handleDeleteVariant = async (variant: ProductVariant) => {
    if (!window.confirm(`Delete variant ${variant.sku}?`)) return;
    try {
      await productVariantService.deleteVariant(variant.id);
      showToast('Variant deleted successfully', 'success');
      if (typeof id === 'string') {
        await fetchProduct(id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete variant';
      showToast(message, 'error');
    }
  };

  // --- Role Security Authorization Guard ---
  if (isAuthLoading) {
    return <PageLoader label="Validating administrator credentials" />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="page-title text-red-600 font-bold text-2xl mb-2">Admin access required</h1>
        <p className="page-subtitle text-center text-on-surface-variant mb-4">Please authenticate with an admin account to view complete catalog metadata.</p>
        <Link className="px-6 py-2.5 bg-brand-primary text-brand-on-primary rounded-xl font-bold hover:opacity-90 transition-all shadow-md" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  if (isLoading) {
    return <PageLoader label="Loading product blueprint details" />;
  }

  if (!product) {
    return (
      <div className="flex min-h-screen bg-surface-base">
        <Sidebar />
        <main className="flex-1 ml-64 p-10 flex flex-col items-center justify-center">
          <div className="text-center bg-white p-10 border border-surface-container-highest rounded-2xl shadow-xl max-w-md w-full">
            <Package className="w-16 h-16 text-on-surface-variant/40 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-on-surface mb-2">Product Not Found</h2>
            <p className="text-sm text-on-surface-variant mb-6">The product UUID you are trying to view does not exist or has been permanently pruned.</p>
            <button 
              onClick={() => router.push(ROUTES.adminProducts)}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-brand-on-primary py-3 rounded-xl font-bold hover:opacity-95 transition-all shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Catalog</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- Calculations for metrics ---
  const variants = product.variants || [];
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const totalVariantPrice = variants.reduce((sum, v) => sum + Number(v.price), 0);
  const avgVariantPrice = variants.length > 0 ? totalVariantPrice / variants.length : Number(product.basePrice);
  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop'];

  return (
    <div className="flex min-h-screen bg-surface-base font-sans selection:bg-brand-primary selection:text-brand-on-primary">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Content */}
      <main className="flex-1 ml-64 p-10 mx-auto w-full">
        {/* Navigation & Header row */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/admin/products')}
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-on-surface-variant hover:text-brand-primary transition-colors w-fit group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Catalog</span>
            </button>

            <div className="flex flex-wrap items-center gap-3 mt-1">
              <h2 className="text-4xl font-display font-black text-on-surface tracking-tighter">{product.name}</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all leading-none whitespace-nowrap flex-nowrap ${
                product.isDeleted 
                  ? 'bg-red-50 text-red-600 border-red-100' 
                  : 'bg-brand-primary text-brand-on-primary border-brand-primary'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.isDeleted ? 'bg-red-500' : 'bg-white blink'}`} />
                {product.isDeleted ? 'Inactive' : 'Active'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant/70 font-semibold font-mono mt-0.5">
              <div 
                className="flex items-center gap-1.5 hover:text-brand-primary cursor-pointer transition-colors"
                onClick={() => handleCopyId(product.id, 'id')}
              >
                <span>ID: {product.id}</span>
                {copiedId === product.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-60" />
                )}
              </div>
              <span className="hidden sm:inline opacity-30">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 opacity-60" />
                <span>Added: {new Date(product.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleEditProduct}
              className="flex items-center justify-center gap-2 bg-white border border-surface-container-highest px-5 py-3 rounded-xl font-bold text-sm text-on-surface shadow-sm hover:bg-surface-container active:scale-95 transition-all w-fit cursor-pointer"
            >
              <Edit className="w-4 h-4 text-brand-primary" />
              <span>Edit Product Details</span>
            </button>
            <button
              onClick={handleDeleteProduct}
              className="flex items-center justify-center gap-2 bg-red-50 border border-red-100 px-5 py-3 rounded-xl font-bold text-sm text-red-600 shadow-sm hover:bg-red-100 active:scale-95 transition-all w-fit cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Product</span>
            </button>
          </div>
        </header>

        {/* Dynamic Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Base Price</span>
              <p className="text-3xl font-display font-black text-on-surface font-mono mt-1">{formatCurrency(Number(product.basePrice))}</p>
            </div>
            <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Total Inventory</span>
              <p className={`text-3xl font-display font-black font-mono mt-1 ${totalStock === 0 ? 'text-red-500' : 'text-on-surface'}`}>
                {totalStock}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${totalStock === 0 ? 'bg-red-50 text-red-600' : 'bg-brand-primary/10 text-brand-primary'}`}>
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Active Variants</span>
              <p className="text-3xl font-display font-black text-on-surface font-mono mt-1">{variants.length}</p>
            </div>
            <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Avg Variant Price</span>
              <p className="text-3xl font-display font-black text-on-surface font-mono mt-1">{formatCurrency(Number(avgVariantPrice))}</p>
            </div>
            <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Double-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery & Description */}
          <div className="lg:col-span-5 space-y-6">
            {/* Gallery Panel */}
            <div className="bg-white border border-surface-container-highest p-5 rounded-2xl shadow-sm">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-surface-container-high bg-surface-base">
                <img 
                  src={images[activeImageIndex]} 
                  alt={`${product.name} Preview`} 
                  className="w-full h-full object-cover transition-all hover:scale-105 duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === index 
                          ? 'border-brand-primary scale-95 shadow-md' 
                          : 'border-surface-container-high hover:border-brand-primary/45'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt="thumbnail" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Info Box */}
            <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Product Information</h3>
              
              <div className="space-y-3 divide-y divide-surface-container-high">
                <div className="pt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Category Name</span>
                  <p className="text-sm font-bold text-on-surface mt-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-brand-primary" />
                    <span>{(product as any).category?.name || 'Sneakers'}</span>
                  </p>
                </div>

                <div className="pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Slug Route Prefix</span>
                  <p className="text-xs font-semibold text-on-surface-variant font-mono mt-1 px-2.5 py-1 bg-surface-base rounded-md border border-surface-container-high w-fit">
                    /{product.slug}
                  </p>
                </div>

                <div className="pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Description</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-medium mt-1.5 whitespace-pre-wrap">
                    {product.description || 'No blueprint description provided for this catalog shoe.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Variants Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Product Variants</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">Configure individual sneaker colors, sizes, stocks, and SKUs.</p>
                </div>

                <button
                  onClick={handleOpenCreateVariant}
                  className="flex items-center justify-center gap-1 bg-brand-primary text-brand-on-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-90 active:scale-95 transition-all w-fit cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Create Variants</span>
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <Inbox className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                  <p className="text-sm font-bold text-on-surface uppercase tracking-wide">No Variants Defined</p>
                  <p className="text-xs text-on-surface-variant/70 font-medium max-w-sm mx-auto mt-1">This product currently does not have any variants configured. Define sizes and colors to start listing.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-base text-on-surface-variant border-b border-surface-container-high">
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider">SKU Code</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider">Color</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider">Size</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider">Price</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider">Stock</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high">
                      {variants.map((v) => (
                        <tr key={v.id} className="hover:bg-surface-base/30 transition-colors">
                          <td className="py-4 px-6">
                            <div 
                              className="flex items-center gap-1 text-xs font-semibold text-on-surface hover:text-brand-primary font-mono cursor-pointer transition-colors w-fit"
                              onClick={() => handleCopyId(v.sku, 'sku')}
                            >
                              <span>{v.sku}</span>
                              {copiedId === v.sku ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {v.color && (
                                <span 
                                  className="w-3.5 h-3.5 rounded-full border border-surface-container-highest shadow-sm shrink-0" 
                                  style={{ backgroundColor: v.color.toLowerCase() }}
                                />
                              )}
                              <span className="text-xs font-bold text-on-surface capitalize">{v.color || 'Default'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-xs font-bold text-on-surface">
                            {v.size || 'OS'}
                          </td>
                          <td className="py-4 px-6 font-mono text-xs font-bold text-on-surface">
                            {formatCurrency(Number(v.price))}
                          </td>
                          <td className="py-4 px-6">
                            {v.stock === 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>Sold Out</span>
                              </span>
                            ) : v.stock < 5 ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-amber-600 font-mono">{v.stock}</span>
                                <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                  <span>Low Inventory</span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-emerald-600 font-mono">{v.stock}</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditVariant(v)}
                                className="p-2 text-on-surface-variant hover:text-brand-primary hover:bg-surface-container rounded-lg transition-all active:scale-90"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVariant(v)}
                                className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
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
              )}
            </div>
          </div>
        </div>
      </main>

      <ProductVariantModal
        open={isVariantModalOpen}
        productId={typeof id === 'string' ? id : ''}
        initialVariant={editingVariant}
        onClose={() => {
          setIsVariantModalOpen(false);
          setEditingVariant(null);
        }}
        onSuccess={() => void handleVariantSaved()}
      />

      <ProductFormModal
        open={isProductModalOpen}
        categories={categories}
        initialProduct={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={(updated) => {
          setProduct(updated);
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .blink {
          animation: blink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
}
