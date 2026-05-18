import { Download, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductHeaderProps {
  onAddProductClick: () => void;
  onExportClick?: () => void;
}

/**
 * ProductHeader Component
 * Renders the primary dashboard title and actions (Export & Add Product).
 */
export const ProductHeader = ({
  onAddProductClick,
  onExportClick,
}: ProductHeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      {/* Title block with fade-in animation */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="text-6xl font-display font-black text-on-surface tracking-tighter mb-2">Products</h2>
        <p className="text-lg text-on-surface-variant">Manage inventory, pricing, and drops.</p>
      </motion.div>

      {/* Primary Actions with slide-up animation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-4"
      >
        <button 
          type="button"
          onClick={onExportClick}
          className="bg-white border border-surface-container-highest py-3 px-6 rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2 text-sm font-bold shadow-sm active:scale-95 cursor-pointer text-on-surface"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
        <button 
          type="button"
          onClick={onAddProductClick}
          className="bg-brand-primary text-brand-on-primary py-3 px-6 rounded-xl hover:scale-105 transition-transform duration-300 flex items-center gap-2 text-sm font-extrabold shadow-lg active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          <span>Add Product</span>
        </button>
      </motion.div>
    </header>
  );
};

