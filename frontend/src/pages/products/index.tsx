/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronDown, 
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageLoader } from '@/components/common/PageLoader';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/features/products/services/product.service';
import { categoryService } from '@/features/categories/services/category.service';
import type { Product } from '@/features/products/types/product';
import type { Category } from '@/features/categories/types/category';
import { formatMoney } from '@/utils/format';

const SIZES = ['38', '39', '40', '41', '42', '43', '44', '45', '46'];

export default function AllProductsPage() {
  const { showToast } = useToast();

  // --- Dynamic Database States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filter & Sorting States ---
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(10000000); // Default to a high number, will auto-adjust
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState('Newest Arrivals');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Pagination states
  const [visibleCount, setVisibleCount] = useState(6);

  const defaultImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop';

  // --- Fetch Products and Categories ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ limit: 100 }),
          categoryService.getCategories()
        ]);
        setProducts(prodRes.products || []);
        setCategories(catRes || []);
      } catch (err: any) {
        console.error('Failed to load products/categories:', err);
        showToast('Could not load database records. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    void loadData();
  }, [showToast]);

  // --- Self-Configuring Currency & Price System ---
  const isVnd = useMemo(() => {
    if (products.length === 0) return false;
    // If any product price is greater than 10000, we're dealing with VND values
    return products.some(p => Number(p.basePrice) > 10000);
  }, [products]);

  const maxSliderValue = useMemo(() => {
    if (products.length === 0) return 1000;
    const maxVal = Math.max(...products.map(p => Number(p.basePrice)));
    // Add small buffer to the max price
    return maxVal > 10000 ? Math.ceil(maxVal / 500000) * 500000 : 1000;
  }, [products]);

  // Auto-adjust default price filter state once products load
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange(maxSliderValue);
    }
  }, [products, maxSliderValue]);

  const formatPrice = (price: number) => {
    if (isVnd) {
      return `${price.toLocaleString('vi-VN')} $`;
    }
    return `$${price.toFixed(2)}`;
  };

  // --- Handlers ---
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setPriceRange(maxSliderValue);
    setSelectedSize('');
    setSearchQuery('');
    setSortBy('Newest Arrivals');
  };

  // --- Premium Filtered and Sorted Logic ---
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description?.toLowerCase().includes(query) ||
        (product as any).category?.name?.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter(product => 
        product.categoryId && selectedCategories.includes(product.categoryId)
      );
    }

    // 3. Price Filter (matches coerced basePrice)
    result = result.filter(product => Number(product.basePrice) <= priceRange);

    // 4. Size Filter (checks variants stock and size matching)
    if (selectedSize) {
      result = result.filter(product => 
        product.variants && product.variants.some(variant => 
          variant.size === selectedSize && variant.stock > 0
        )
      );
    }

    // 5. Sorting
    if (sortBy === 'Newest Arrivals') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
    }

    return result;
  }, [products, searchQuery, selectedCategories, priceRange, selectedSize, sortBy]);

  const displayedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

  if (isLoading) {
    return <PageLoader label="Opening ShopKicks Sneaker Vault..." />;
  }

  return (
    <div className="min-h-screen bg-surface-lowest flex flex-col font-sans selection:bg-black selection:text-white">
      <main className="flex-1 mx-auto w-full px-6 md:px-10 pb-20">
        
        {/* Editorial Page Hero Section */}
        <section className="py-16 md:py-20 border-b border-outline-variant/20 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="editorial-title text-black"
            >
              All Sneakers
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-on-surface-variant font-display font-medium text-base"
            >
              Curating {filteredAndSortedProducts.length} high-performance sneaker models
            </motion.p>
          </div>

          {/* Stand-alone Search Input inside page */}
          <div className="flex items-center bg-surface-low border border-outline-variant/30 rounded-full px-5 py-3 w-full md:w-120 shadow-sm focus-within:border-black/35 transition-all">
            <Search className="w-4 h-4 text-on-surface-variant mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full font-semibold text-black placeholder-on-surface-variant/50"
            />
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 space-y-10 shrink-0">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h2 className="font-display text-xl font-black uppercase tracking-tight text-black">Filters</h2>
              <button 
                onClick={clearAll}
                className="text-base hover:text-black transition-colors underline underline-offset-4 cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-base text-gray-600 font-semibold">Category</h3>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-5 h-5 border-2 border-outline-variant/50 rounded checked: checked:bg-black checked:border-black transition-all cursor-pointer"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      <motion.div 
                        initial={false}
                        animate={{ opacity: selectedCategories.includes(cat.id) ? 1 : 0 }}
                        className="absolute pointer-events-none text-white"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                      </motion.div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-black transition-colors capitalize">
                      {cat.name}
                    </span>
                  </label>
                ))}
                {categories.length === 0 && (
                  <p className="text-xs text-on-surface-variant/50 italic">No categories registered.</p>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h3 className="text-base text-gray-600 font-semibold">Size (US Men)</h3>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((size) => {
                  const isActive = selectedSize === size;
                  return (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(isActive ? '' : size)}
                      className={`py-2.5 text-xs font-bold border rounded transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-black text-white border-black shadow' 
                          : 'bg-transparent border-outline-variant/30 hover:border-black text-on-surface-variant hover:text-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-6">
              <h3 className="text-base text-gray-600 font-semibold">Price Range</h3>
              <div className="space-y-6">
                <input 
                  type="range" 
                  min="0" 
                  max={maxSliderValue} 
                  step={isVnd ? 100000 : 10}
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-1 bg-outline-variant/20 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-base">Min</span>
                    <div className="border-b border-outline-variant/30 py-1 font-display font-bold text-sm text-black">
                      {formatMoney(1000000)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-base">Max</span>
                    <div className="border-b border-outline-variant/30 py-1 font-display font-bold text-sm text-black">
                      {formatMoney(priceRange)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Panel */}
          <div className="flex-1 space-y-12">
            
            {/* Sorting Header */}
            <div className="flex justify-end relative">
              <div className="relative">
                <button 
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-2 group cursor-pointer py-1"
                >
                  <span className="text-base font-semibold text-gray-700">Sort By: {sortBy}</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5 text-black" />
                </button>
                
                <AnimatePresence>
                  {isSortDropdownOpen && (
                    <>
                      {/* Backdrop for closing */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsSortDropdownOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 z-20 w-48 border border-outline-variant/30 bg-white p-2 shadow-lg rounded-xl flex flex-col gap-1"
                      >
                        {['Newest Arrivals', 'Price: Low to High', 'Price: High to Low'].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                              sortBy === option 
                                ? 'bg-black text-white' 
                                : 'text-on-surface-variant hover:bg-surface-low hover:text-black'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              <AnimatePresence mode="popLayout">
                {displayedProducts.map((product) => {
                  const imageUrl = product.images?.[0] || defaultImage;
                  return (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group"
                    >
                      <Link href={`/products/${product.id}`} className="block space-y-4">
                        <div className="relative aspect-[3/4] bg-surface-low rounded-xl overflow-hidden shadow-sm">
                          <img 
                            src={imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          {/* Available sizes counter */}
                          {product.variants && product.variants.length > 0 && (
                            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded">
                              {product.variants.filter(v => v.stock > 0).length} Sizes
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        </div>
                        <div className="space-y-1 px-1">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-display text-lg font-black tracking-tight text-black group-hover:text-primary transition-colors leading-tight uppercase truncate">
                              {product.name}
                            </h3>
                            <span className="price-display text-black shrink-0">
                              {formatMoney(Number(product.basePrice))}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                            {(product as any).category?.name || 'Sneakers'}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredAndSortedProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center space-y-5 border border-dashed border-outline-variant/30 rounded-2xl bg-white p-8"
              >
                <Search className="w-12 h-12 mx-auto text-on-surface-variant/20" />
                <p className="text-xl font-display font-black uppercase tracking-tight text-black">No sneakers found</p>
                <p className="text-xs text-on-surface-variant font-medium">Try adjusting your category checks, price cap, or search query.</p>
                <button 
                  onClick={clearAll}
                  className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all rounded cursor-pointer"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}

            {/* Load More Button */}
            {filteredAndSortedProducts.length > visibleCount && (
              <div className="pt-8 flex justify-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="bg-black text-white px-10 py-4.5 text-xs font-bold uppercase tracking-widest hover:bg-black/90 active:scale-95 transition-all shadow-md rounded cursor-pointer"
                >
                  Load More Results
                </button>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
