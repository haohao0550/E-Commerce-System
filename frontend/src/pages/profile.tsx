import { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Package, 
  Truck, 
  Shield, 
  LogOut 
} from 'lucide-react';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/routes';
import { ProfileForm } from '@/components/users/ProfileForm';
import { ChangePasswordForm } from '@/components/users/ChangePasswordForm';
import { DeleteAccountPanel } from '@/components/users/DeleteAccountPanel';
import { RecentOrder } from '@/components/users/RecentOrder';
import { ShippingAddress } from '@/components/users/ShippingAddress';

type ProfileTab = 'details' | 'orders' | 'addresses' | 'security';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('details');

  if (isLoading) {
    return <PageLoader label="Loading profile" />;
  }

  if (!user) {
    return (
      <main className="page py-12">
        <h1 className="text-headline-lg mb-2 uppercase">Sign in required</h1>
        <p className="text-sm text-on-surface-variant font-medium mb-8">Please sign in to view and manage your profile.</p>
        <Link className="bg-primary text-on-primary text-label-lg py-4 px-12 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all inline-block" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="page py-12">
      {/* Hero Header */}
      <header className="mb-16">
        <h1 className="text-display-lg text-primary uppercase">My Account</h1>
        <p className="text-xl text-on-surface-variant font-medium mt-2">
          Welcome back, {user.name || user.email}. Manage your preferences and track your speed.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Sidebar Navigation */}
        <aside className="md:col-span-3">
          <nav className="flex flex-row overflow-x-auto gap-2 md:flex-col md:overflow-x-visible pb-4 md:pb-0 border-b md:border-b-0 border-outline-variant/30 md:pr-4">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all active:scale-95 text-label-lg w-full text-left ${
                activeTab === 'details' 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <span>Personal Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all active:scale-95 text-label-lg w-full text-left ${
                activeTab === 'orders' 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Package className="w-5 h-5 flex-shrink-0" />
              <span>Order History</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all active:scale-95 text-label-lg w-full text-left ${
                activeTab === 'addresses' 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Truck className="w-5 h-5 flex-shrink-0" />
              <span>Shipping Addresses</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all active:scale-95 text-label-lg w-full text-left ${
                activeTab === 'security' 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Security</span>
            </button>

            <hr className="my-4 border-outline-variant/30 hidden md:block" />

            <button
              type="button"
              onClick={() => void logout()}
              className="text-red-600 flex items-center gap-3 px-6 py-4 rounded-lg hover:bg-red-50 transition-colors text-label-lg w-full text-left active:scale-95 font-semibold"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <section className="md:col-span-9 space-y-12">
          {activeTab === 'details' && <ProfileForm />}
          
          {activeTab === 'orders' && <RecentOrder />}
          
          {activeTab === 'addresses' && <ShippingAddress />}

          {activeTab === 'security' && (
            <div className="space-y-12">
              <ChangePasswordForm />
              <DeleteAccountPanel />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

