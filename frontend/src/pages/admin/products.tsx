import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PageLoader } from '@/components/common/PageLoader';
import { Sidebar } from '@/layout/Sidebar';
import { ProductHeader } from '@/features/products/components/ProductHeader';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { ProductTable } from '@/features/products/components/ProductTable';
import { ProductPagination } from '@/features/products/components/ProductPagination';
import { ProductFormModal } from '@/features/products/components/ProductFormModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/features/products/services/product.service';
import { categoryService } from '@/features/categories/services/category.service';
import { ROUTES } from '@/routes';
import type { Product } from '@/features/products/types/product';
import type { Category } from '@/features/categories/types/category';

/**
 * AdminProductsPage Component
 * Main orchestrator page for Products management inside the Admin Panel.
 * Deconstructs logic into modular components: Sidebar, Header, Filters, Table, and Pagination.
 */
export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  // --- Products State Management ---
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Categories State Management ---
  const [categories, setCategories] = useState<Category[]>([]);

  // --- Filtering & Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const productsPerPage = 10;

  // --- API Data Fetcher ---
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      // Build API request payload queries
      const response = await productService.getProducts({
        page: currentPage,
        limit: productsPerPage,
        keyword: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
      });

      if (response && response.products) {
        setProducts(response.products);
        setTotalProducts(response.pagination?.total || response.products.length);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      showToast('Failed to load products from database', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [currentPage, searchQuery, selectedCategory, showToast]);

  // Refetch data when query parameters change
  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // Fetch real categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories for filter dropdown:', err);
      }
    };
    void fetchCategories();
  }, []);

  // Reset pagination to page 1 upon new search filters
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    // Client-side sort simulation or trigger backend search depending on route parameters
    const sorted = [...products].sort((a, b) => {
      const priceA = Number(a.basePrice);
      const priceB = Number(b.basePrice);
      if (sort === 'price-asc') return priceA - priceB;
      if (sort === 'price-desc') return priceB - priceA;
      return 0; // Default newest keeps state sorted by default database response
    });
    setProducts(sorted);
  };

  // --- Action Handlers ---
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleExport = () => {
    showToast('Exporting product inventory sheet...', 'success');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductSaved = async () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    await fetchProducts();
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;

    try {
      await productService.deleteProduct(product.id);
      showToast(`Deleted ${product.name} successfully!`, 'success');
      void fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Failed to delete product', 'error');
    }
  };

  // --- Role Authorization Security Guard ---
  if (isAuthLoading) {
    return <PageLoader label="Validating administrator session" />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="page-title text-red-600">Admin access required</h1>
        <p className="page-subtitle text-center">Please authenticate with an admin account to manage items.</p>
        <Link className="pill-link bg-primary text-white" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-base font-sans selection:bg-brand-primary selection:text-brand-on-primary">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-10 mx-auto w-full">
        {/* Dynamic Responsive Product Header */}
        <ProductHeader
          onAddProductClick={handleAddProduct}
          onExportClick={handleExport}
        />

        {/* Filters and Search Controllers */}
        <ProductFilters
          search={searchQuery}
          onSearchChange={handleSearchChange}
          category={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* Dynamic Products Catalog Grid */}
        <ProductTable
          products={products}
          isLoading={isLoadingProducts}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onRowClick={(id: string) => router.push(`/admin/products/${id}`)}
        />

        {/* Bottom Pagination Footnotes */}
        <ProductPagination
          currentPage={currentPage}
          totalProducts={totalProducts}
          productsPerPage={productsPerPage}
          onPrevPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNextPage={() => setCurrentPage((prev) => prev + 1)}
        />
      </main>

      <ProductFormModal
        open={isProductModalOpen}
        categories={categories}
        initialProduct={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => void handleProductSaved()}
      />

      {/* Dynamic Keyframes inject */}
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

