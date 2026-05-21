import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TicketPercent,
  Settings,
  LogOut,
  Layers
} from 'lucide-react';
import { ROUTES } from '@/routes';
import { useAuth } from '@/context/AuthContext';

/**
 * Sidebar Component
 * Shared sidebar navigation panel for all Administrator pages.
 * Detects current active path to render appropriate styles and transitions.
 */
export const Sidebar = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.admin },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'categories', label: 'Categories', icon: Layers, path: ROUTES.adminCategories },
    { id: 'users', label: 'Users', icon: Users, path: ROUTES.adminUsers },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, path: ROUTES.adminOrders },
    { id: 'coupons', label: 'Coupons', icon: TicketPercent, path: ROUTES.adminCoupons },
  ];

  return (
    <aside
      id="sidebar"
      className="fixed left-0 top-0 h-screen w-64 bg-surface-container border-r border-surface-container-high flex flex-col p-6 z-40"
    >
      {/* Brand Header */}
      <div className="mb-10 px-2">
        <Link href={ROUTES.home}>
          <span className="text-2xl font-display font-black tracking-tight text-on-surface hover:opacity-85 transition-opacity cursor-pointer">
            Admin Console
          </span>
        </Link>
        <p className="text-xs font-medium text-on-surface-variant/70 mt-1">ShopKicks Management</p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon || Package;
          const isActive = router.pathname === item.path;

          return (
            <Link key={item.id} href={item.path}>
              <span
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${isActive
                  ? 'bg-brand-primary text-brand-on-primary shadow-md font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
                  }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'fill-current opacity-100' : 'opacity-70 group-hover:opacity-100'
                    }`}
                />
                <span className="text-sm">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Utility Actions */}
      <div className="mt-auto space-y-1 pt-6 border-t border-surface-container-high">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all font-semibold text-sm text-left cursor-pointer"
        >
          <Settings className="w-5 h-5 opacity-70" />
          <span>Settings</span>
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all font-semibold text-sm text-left cursor-pointer"
        >
          <LogOut className="w-5 h-5 opacity-70" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

