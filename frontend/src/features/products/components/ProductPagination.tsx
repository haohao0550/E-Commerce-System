import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductPaginationProps {
  currentPage: number;
  totalProducts: number;
  productsPerPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

/**
 * ProductPagination Component
 * Responsive pagination controls with custom arrow icons.
 */
export const ProductPagination = ({
  currentPage,
  totalProducts,
  productsPerPage,
  onPrevPage,
  onNextPage,
}: ProductPaginationProps) => {
  const startItem = (currentPage - 1) * productsPerPage + 1;
  const endItem = Math.min(currentPage * productsPerPage, totalProducts);
  const totalPages = Math.ceil(totalProducts / productsPerPage) || 1;

  return (
    <footer className="px-8 py-5 border-t border-surface-container-high bg-surface-container-low flex items-center justify-between">
      <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
        Showing {totalProducts === 0 ? 0 : startItem} to {endItem} of {totalProducts} products
      </p>
      <div className="flex items-center gap-2">
        <button 
          type="button"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-surface-container-highest text-on-surface hover:bg-surface-container disabled:opacity-30 transition-all shadow-sm bg-white active:scale-90 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          type="button"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-surface-container-highest text-on-surface hover:bg-surface-container disabled:opacity-30 transition-all shadow-sm bg-white active:scale-90 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};

