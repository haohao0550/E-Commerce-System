import { Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from '@/features/products/types/product';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onRowClick?: (id: string) => void;
}

/**
 * ProductTable Component
 * Renders list of dynamic sneakers products in a premium dashboard table.
 * Includes pulsating loading states and structured action triggers.
 */
export const ProductTable = ({
  products,
  isLoading,
  onEditProduct,
  onDeleteProduct,
  onRowClick,
}: ProductTableProps) => {
  const defaultImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop';

  // --- Shimmer Skeleton Loader ---
  if (isLoading) {
    return (
      <div className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-xl animate-pulse">
        <div className="bg-brand-primary h-14 w-full" />
        <div className="divide-y divide-surface-container-high">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-8 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-1/3">
                <div className="w-20 h-20 bg-surface-container rounded-xl shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-6 bg-surface-container rounded w-3/4" />
                  <div className="h-4 bg-surface-container rounded w-1/2" />
                </div>
              </div>
              <div className="h-5 bg-surface-container rounded w-20" />
              <div className="h-6 bg-surface-container rounded w-14" />
              <div className="h-6 bg-surface-container rounded w-16" />
              <div className="h-8 bg-surface-container rounded w-24" />
              <div className="h-10 bg-surface-container rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Empty Products State ---
  if (products.length === 0) {
    return (
      <div className="text-center py-24 bg-white border border-surface-container-highest rounded-2xl shadow-xl p-10">
        <p className="text-xl font-bold text-on-surface mb-2 uppercase tracking-wide">No products found</p>
        <p className="text-sm text-on-surface-variant/70 font-medium">Add products to your catalog to get started.</p>
      </div>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-brand-primary text-brand-on-primary">
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Product</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Category</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Price</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Stock</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Status</th>
              <th className="py-5 px-8 text-xs font-black uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-surface-container-high">
            <AnimatePresence>
              {products.map((product) => {
                const mainImage = product.images?.[0] || defaultImage;
                const status = product.isDeleted ? 'Inactive' : 'Active';
                const categoryName = (product as any).category?.name || 'Sneakers';

                return (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onRowClick?.(product.id)}
                    className="group hover:bg-surface-base/50 transition-colors cursor-pointer"
                  >
                    {/* Column 1: Image, Name, and SKU */}
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-surface-container-highest transition-transform group-hover:scale-105 duration-500 shadow-sm ${status === 'Inactive' ? 'grayscale opacity-60' : ''}`}>
                          <img 
                            src={mainImage} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="text-xl font-display font-bold text-on-surface leading-tight">{product.name}</p>
                          <p className="text-xs font-semibold text-on-surface-variant/60 mt-1 uppercase tracking-tight font-mono">
                            SKU: {product.slug.toUpperCase().slice(0, 10)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Category */}
                    <td className="py-5 px-8">
                      <span className="text-sm font-semibold text-on-surface-variant font-mono">{categoryName}</span>
                    </td>

                    {/* Column 3: Price */}
                    <td className="py-5 px-8">
                      <span className="text-base font-black text-on-surface font-mono">
                        ${Number(product.basePrice).toFixed(2)}
                      </span>
                    </td>

                    {/* Column 4: Stock */}
                    <td className="py-5 px-8">
                      {(() => {
                        const totalStock = product.variants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : 0;
                        const variantCount = product.variants ? product.variants.length : 0;
                        
                        return (
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold font-mono ${totalStock === 0 ? 'text-red-500' : 'text-on-surface'}`}>
                              {totalStock} <span className="text-xs text-on-surface-variant font-sans font-medium">units</span>
                            </span>
                            <span className="text-[10px] font-semibold text-on-surface-variant/60 font-sans mt-0.5">
                              {variantCount === 0 
                                ? 'No variants' 
                                : `${variantCount} variant${variantCount > 1 ? 's' : ''}`
                              }
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Column 5: Status Badge */}
                    <td className="py-5 px-8">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        status === 'Active' 
                          ? 'bg-brand-primary text-brand-on-primary border-brand-primary shadow-sm' 
                          : 'bg-surface-container-highest text-on-surface-variant border-surface-container-high'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-white blink' : 'bg-on-surface-variant/40'}`} />
                        {status}
                      </span>
                    </td>

                    {/* Column 6: Action Buttons */}
                    <td className="py-5 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => onEditProduct(product)}
                          className="p-2.5 text-on-surface-variant hover:text-brand-primary hover:bg-surface-container rounded-xl transition-all active:scale-90 cursor-pointer"
                        >
                          <Edit className="w-5 h-5 flex-shrink-0" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => onDeleteProduct(product)}
                          className="p-2.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                        >
                          <Trash2 className="w-5 h-5 flex-shrink-0" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.section>
  );
};

