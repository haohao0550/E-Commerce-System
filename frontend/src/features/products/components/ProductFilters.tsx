import { Search, ChevronDown } from 'lucide-react';
import type { Category } from '@/features/categories/types/category';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  sortBy: string;
  onSortChange: (value: string) => void;
}

/**
 * ProductFilters Component
 * Search and Filter actions bar for sorting through the product catalog.
 */
export const ProductFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
}: ProductFiltersProps) => {
  return (
    <section className="bg-surface-container border border-surface-container-highest rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
      {/* Search Input Block */}
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-brand-primary transition-colors w-5 h-5" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sneakers..."
          className="w-full bg-white border border-surface-container-highest focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all outline-none py-3 pl-12 pr-4 rounded-lg shadow-sm placeholder:text-on-surface-variant/50 text-sm text-on-surface"
        />
      </div>

      {/* Structured Select Dropdowns */}
      <div className="flex gap-3 w-full md:w-auto">
        {/* Category Filter */}
        <div className="relative bg-white border border-surface-container-highest rounded-lg overflow-hidden shadow-sm flex items-center pr-3">
          <select 
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold text-on-surface outline-none cursor-pointer"
          >
            <option value="">Category: All</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 pointer-events-none w-3.5 h-3.5 opacity-50 text-on-surface" />
        </div>

        {/* Sort Filter */}
        <div className="relative bg-white border border-surface-container-highest rounded-lg overflow-hidden shadow-sm flex items-center pr-3">
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold text-on-surface outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-3 pointer-events-none w-3.5 h-3.5 opacity-50 text-on-surface" />
        </div>
      </div>
    </section>
  );
};


