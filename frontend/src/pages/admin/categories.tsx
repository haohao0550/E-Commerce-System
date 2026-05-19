import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FolderKanban,
  Calendar,
  X,
  Layers,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageLoader } from '@/components/common/PageLoader';
import { Sidebar } from '@/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { categoryService } from '@/features/categories/services/category.service';
import { ROUTES } from '@/routes';
import type { Category } from '@/features/categories/types/category';

export default function AdminCategoriesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  // --- Category State Management ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Modal Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch Categories ---
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      showToast('Failed to load categories from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      void fetchCategories();
    }
  }, [user]);

  // --- Search & Filter Logic ---
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
      const slugMatch = cat.slug.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || slugMatch;
    });
  }, [categories, searchQuery]);

  // --- Modal Open Handlers ---
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setCategoryName('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setCategoryName(category.name);
    setIsModalOpen(true);
  };

  // --- Form Action Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast('Category name cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        await categoryService.createCategory(categoryName.trim());
        showToast('Created category successfully!', 'success');
      } else if (modalMode === 'edit' && selectedCategory) {
        await categoryService.updateCategory(selectedCategory.id, categoryName.trim());
        showToast(`Updated category "${categoryName.trim()}" successfully!`, 'success');
      }
      setIsModalOpen(false);
      void fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Handler ---
  const handleDeleteCategory = async (category: Category) => {
    const confirmationText = `Are you sure you want to delete the "${category.name}" category?\n\nNote: Products belonging to this category will have their category field set to null.`;
    if (!window.confirm(confirmationText)) return;

    try {
      await categoryService.deleteCategory(category.id);
      showToast(`Deleted category "${category.name}" successfully!`, 'success');
      void fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      showToast(err.message || 'Failed to delete category', 'error');
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
        <p className="page-subtitle text-center text-on-surface-variant mb-4">Please authenticate with an admin account to manage database structure.</p>
        <Link className="px-6 py-2.5 bg-brand-primary text-brand-on-primary rounded-xl font-bold hover:opacity-90 transition-all shadow-md" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-base font-sans selection:bg-brand-primary selection:text-brand-on-primary">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Workspace */}
      <main className="flex-1 ml-64 p-10 max-w-[1440px] mx-auto w-full">
        {/* Header Console */}
        <header className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="text-6xl font-display font-black text-on-surface tracking-tighter mb-2">Categories</h2>
            <p className="text-lg text-on-surface-variant font-medium">Create shoe classifications, filter tags, and catalog collections.</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-brand-primary text-brand-on-primary px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Create Category</span>
          </motion.button>
        </header>

        {/* Stats Metrics Panels */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Total Collections</span>
              <p className="text-3xl font-display font-black text-on-surface font-mono mt-1">{categories.length}</p>
            </div>
            <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Sneaker Catalog</span>
              <Link href="/admin/products">
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-brand-primary hover:opacity-85 transition-opacity mt-3 cursor-pointer">
                  <span>Manage Drops</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <section className="bg-surface-container border border-surface-container-highest rounded-xl p-5 mb-8 flex items-center gap-4 shadow-sm">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-brand-primary transition-colors w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category name or slug..."
              className="w-full bg-white border border-surface-container-highest focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all outline-none py-3 pl-12 pr-4 rounded-lg shadow-sm placeholder:text-on-surface-variant/50 text-sm text-on-surface"
            />
          </div>
        </section>

        {/* Dynamic Category Catalog Table */}
        {isLoading ? (
          <div className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-xl animate-pulse">
            <div className="bg-brand-primary h-14 w-full" />
            <div className="divide-y divide-surface-container-high">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-8 flex items-center justify-between gap-6">
                  <div className="space-y-2 w-1/3">
                    <div className="h-6 bg-surface-container rounded w-3/4" />
                    <div className="h-4 bg-surface-container rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-surface-container rounded w-32" />
                  <div className="h-8 bg-surface-container rounded w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-white border border-surface-container-highest rounded-2xl shadow-xl p-8">
            <p className="text-xl font-bold text-on-surface mb-2 uppercase tracking-wide">No Categories Found</p>
            <p className="text-sm text-on-surface-variant/70 font-medium">Create a category collection to cluster your products catalog.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-primary text-brand-on-primary">
                    <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Category Name</th>
                    <th className="py-5 px-8 text-xs font-black uppercase tracking-widest">Created Date</th>
                    <th className="py-5 px-8 text-xs font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  <AnimatePresence>
                    {filteredCategories.map((cat) => (
                      <motion.tr
                        key={cat.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-surface-base/50 transition-colors"
                      >
                        <td className="py-5 px-8">
                          <p className="text-lg font-bold text-on-surface">{cat.name}</p>
                        </td>
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant/80">
                            <Calendar className="w-4 h-4 opacity-60 shrink-0" />
                            <span>{new Date(cat.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                          </div>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(cat)}
                              className="p-2.5 text-on-surface-variant hover:text-brand-primary hover:bg-surface-container rounded-xl transition-all active:scale-90 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-2.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>

      {/* Dynamic Create/Edit Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white border border-surface-container-highest rounded-2xl overflow-hidden shadow-2xl p-6 z-10"
            >
              {/* Top Row Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-black text-on-surface">
                  {modalMode === 'create' ? 'Create Collection' : 'Modify Collection'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name-input" className="text-xs font-black uppercase tracking-widest text-on-surface-variant/80">
                    Category Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. High-Top, Running, Retro..."
                    className="w-full bg-white border border-surface-container-highest focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all outline-none py-3.5 px-4 rounded-xl shadow-sm placeholder:text-on-surface-variant/40 text-sm text-on-surface"
                    autoFocus
                  />
                  <p className="text-[10px] text-on-surface-variant/50 font-medium">
                    The name is used for admin dropdown filters and is parsed into slug routes for URL filtering.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-on-surface-variant hover:bg-surface-container rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-brand-primary text-brand-on-primary text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-brand-on-primary border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    <span>{modalMode === 'create' ? 'Add Category' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

