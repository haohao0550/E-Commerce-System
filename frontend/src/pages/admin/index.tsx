import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { PageLoader } from '@/components/common/PageLoader';
import { Sidebar } from '@/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/features/products/services/product.service';
import { userService } from '@/features/users/services/user.service';
import { ROUTES } from '@/routes';
import type { Product } from '@/features/products/types/product';
import type { User } from '@/features/users/types/user';

/**
 * AdminDashboardPage Component
 * The main entry point for the Admin system panel.
 * Provides KPI metric overviews and real-time database summary views.
 */
export default function AdminDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  // --- Real-time Metrics and List States ---
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    const loadDashboardData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch products and users in parallel to minimize load delays
        const [productsRes, usersRes] = await Promise.all([
          productService.getProducts({ page: 1, limit: 5 }),
          userService.getUsers({ page: 1, limit: 5 }),
        ]);

        if (productsRes && productsRes.products) {
          setRecentProducts(productsRes.products.slice(0, 3));
          setProductCount(productsRes.pagination?.total || productsRes.products.length);
        }

        if (usersRes && usersRes.users) {
          setRecentUsers(usersRes.users.slice(0, 3));
          setUserCount(usersRes.pagination?.total || usersRes.users.length);
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        showToast('Failed to load live database summaries', 'error');
      } finally {
        setIsLoadingData(false);
      }
    };

    void loadDashboardData();
  }, [user, showToast]);

  // --- Role Security Guard ---
  if (isAuthLoading) {
    return <PageLoader label="Authenticating Administrator session" />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="page-title text-red-600">Admin access required</h1>
        <p className="page-subtitle text-center">Please authenticate with an administrator account to view details.</p>
        <Link className="pill-link bg-primary text-white" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-base font-sans selection:bg-brand-primary selection:text-brand-on-primary">
      {/* Fixed Admin Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <main className="flex-1 ml-64 p-10 max-w-[1440px] mx-auto w-full">
        {/* Header Block */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="text-6xl font-display font-black text-on-surface tracking-tighter mb-2">Dashboard</h2>
            <p className="text-lg text-on-surface-variant">System controls, database analytics, and business insights.</p>
          </motion.div>
        </header>

        {/* Quick KPI Stats Summary Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stat Item 1: Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Total Revenue</span>
              <div className="bg-[#e6f4ea] text-[#137333] p-2.5 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display font-black text-on-surface font-mono">$45,210.00</p>
            <p className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant/40 mt-1">
              +12.4% From last month
            </p>
          </motion.div>

          {/* Stat Item 2: Active Users */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Total Users</span>
              <div className="bg-[#e8f0fe] text-[#1a73e8] p-2.5 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display font-black text-on-surface font-mono">
              {isLoadingData ? '...' : userCount}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant/40 mt-1">
              Registered Accounts
            </p>
          </motion.div>

          {/* Stat Item 3: Active Products */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Total Sneakers</span>
              <div className="bg-[#fef7e0] text-[#b06000] p-2.5 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display font-black text-on-surface font-mono">
              {isLoadingData ? '...' : productCount}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant/40 mt-1">
              Active drops in database
            </p>
          </motion.div>

          {/* Stat Item 4: Pending Orders */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white border border-surface-container-highest p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Pending Orders</span>
              <div className="bg-[#fce8e6] text-[#c5221f] p-2.5 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display font-black text-on-surface font-mono">8</p>
            <p className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant/40 mt-1">
              Awaiting packaging
            </p>
          </motion.div>
        </section>

        {/* Live Database Overview Columns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Live Products Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white border border-surface-container-highest rounded-2xl p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold text-on-surface">Recent Products</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-primary text-brand-on-primary">
                  <span className="w-1.5 h-1.5 bg-white rounded-full blink" />
                  Live
                </span>
              </div>

              {isLoadingData ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-surface-container-low rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentProducts.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-6 font-medium">No products found in DB.</p>
              ) : (
                <div className="divide-y divide-surface-container-high">
                  {recentProducts.map((prod) => (
                    <div key={prod.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden shrink-0 border border-surface-container-highest">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-base font-bold text-on-surface leading-snug">{prod.name}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-tight">
                            Category: {(prod as any).category?.name || 'Sneakers'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-on-surface font-mono">
                        ${Number(prod.basePrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-surface-container-high">
              <Link href="/admin/products">
                <span className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-primary hover:opacity-85 transition-opacity cursor-pointer uppercase tracking-wider">
                  <span>Manage Products</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Column 2: Live Users Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white border border-surface-container-highest rounded-2xl p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold text-on-surface">Recent Accounts</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-primary text-brand-on-primary">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Secured
                </span>
              </div>

              {isLoadingData ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-surface-container-low rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentUsers.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-6 font-medium">No users registered.</p>
              ) : (
                <div className="divide-y divide-surface-container-high">
                  {recentUsers.map((u) => (
                    <div key={u.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container rounded-full overflow-hidden shrink-0 border border-surface-container-highest">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop'}
                            alt={u.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-base font-bold text-on-surface leading-snug">{u.name || 'Anonymous User'}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-tight">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-surface-container-highest px-2.5 py-1 rounded border border-surface-container-high text-on-surface-variant">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-surface-container-high">
              <Link href={ROUTES.adminUsers}>
                <span className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-primary hover:opacity-85 transition-opacity cursor-pointer uppercase tracking-wider">
                  <span>Manage Users</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

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

