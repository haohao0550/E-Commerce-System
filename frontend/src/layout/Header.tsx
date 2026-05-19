import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/routes';

export const Header = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userLabel = user?.name || user?.email || 'Account';

  const navigationItems = [
    { label: 'Home', path: ROUTES.home },
    { label: 'Shop', path: ROUTES.products },
    { label: 'New Arrivals', path: '/#new-arrivals' },
    { label: 'Trending', path: '/#trending' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="max-w-[1440px] mx-auto px-10 py-4 flex justify-between items-center w-full">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-12">
          <Link href={ROUTES.home} className="text-headline-md font-bold tracking-tight text-on-surface hover:opacity-85 transition-opacity">
            ShopKicks
          </Link>
          <div className="hidden md:flex gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className="text-on-surface-variant font-medium hover:text-on-surface transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Search, Cart & User Action */}
        <div className="flex items-center gap-6">
          {/* Sneaker Search Pill */}
          <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20">
            <Search className="w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search sneakers..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 outline-none"
            />
          </div>

          <div className="flex gap-4 items-center">
            {/* Cart Button */}
            <button className="text-on-surface hover:opacity-70 transition-opacity relative p-1">
              <ShoppingCart className="w-6 h-6" />
            </button>

            {/* User Dropdown / Auth Link */}
            <div className="relative flex items-center">
              {user ? (
                <>
                  <button 
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className={`text-on-surface transition-all p-1 ${
                      isProfileOpen ? 'border-b-2 border-primary' : 'hover:opacity-75'
                    }`}
                  >
                    <User className="w-6 h-6" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-12 z-50 w-72 border border-outline-variant/30 bg-surface p-5 shadow-lg rounded-2xl"
                      >
                        <div className="border-b border-outline-variant/30 pb-4">
                          <p className="text-base font-bold text-on-surface">{userLabel}</p>
                          <p className="mt-1 text-sm text-on-surface-variant">{user.email}</p>
                          <span className="mt-3 inline-flex rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface">
                            {user.role}
                          </span>
                        </div>
                        <div className="grid gap-3 py-4 text-sm font-semibold text-on-surface-variant">
                          <Link 
                            href={ROUTES.profile} 
                            className="hover:text-on-surface transition-colors" 
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Profile
                          </Link>
                          {user.role === 'ADMIN' && (
                            <Link 
                              href={ROUTES.admin} 
                              className="hover:text-on-surface transition-colors" 
                              onClick={() => setIsProfileOpen(false)}
                            >
                              Admin Dashboard
                            </Link>
                          )}
                        </div>
                        <button
                          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity mt-2"
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            void logout();
                          }}
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <div className="hidden md:flex items-center gap-6">
                    <Link 
                      href={ROUTES.login}
                      className="text-sm font-semibold tracking-wide uppercase text-on-surface-variant hover:text-primary transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      href={ROUTES.register}
                      className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold tracking-widest text-white hover:bg-on-surface transition-all active:scale-95 duration-300 shadow-sm"
                      style={{ color: '#ffffff' }}
                    >
                      REGISTER
                    </Link>
                  </div>
                  <Link 
                    href={ROUTES.login}
                    className="md:hidden text-on-surface hover:opacity-70 transition-opacity p-1"
                  >
                    <User className="w-6 h-6" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-on-surface transition-transform hover:scale-110 active:scale-95 ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-outline-variant/30 bg-surface md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className="py-2 text-lg font-bold text-on-surface"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {!user ? (
                <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-4 mt-2">
                  <Link
                    href={ROUTES.login}
                    className="flex w-full items-center justify-center rounded-full border border-outline-variant py-3 text-sm font-bold tracking-widest text-on-surface hover:border-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    LOGIN
                  </Link>
                  <Link
                    href={ROUTES.register}
                    className="flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold tracking-widest !text-white hover:bg-on-surface transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ color: '#ffffff' }}
                  >
                    REGISTER
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-4 mt-2">
                  <p className="text-sm font-bold text-on-surface px-2">Account: {userLabel}</p>
                  <Link
                    href={ROUTES.profile}
                    className="py-2 px-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href={ROUTES.admin}
                      className="py-2 px-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    className="flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold tracking-widest text-on-primary hover:bg-on-surface transition-colors mt-2"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      void logout();
                    }}
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

