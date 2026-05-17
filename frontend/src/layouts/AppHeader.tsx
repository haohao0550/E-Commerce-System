'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userLabel = user?.name || user?.email || 'Account';
  const initials = userLabel
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="flex h-9 items-center justify-between bg-[#f5f5f5] px-12 text-xs font-medium text-[#111111] max-sm:px-4">
        <span>K-Fresh Member Access</span>
        <div className="flex gap-[18px]">
          <Link href={ROUTES.register}>Join Us</Link>
          <Link href={ROUTES.login}>Sign In</Link>
        </div>
      </div>
      <header className="sticky top-0 z-10 grid min-h-16 grid-cols-[120px_1fr_240px] items-center bg-white px-12 shadow-[inset_0_-1px_0_#e5e5e5] max-lg:grid-cols-[56px_1fr] max-lg:px-6 max-sm:px-4">
        <Link
          className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-base font-bold text-white"
          href={ROUTES.home}
          aria-label="K-Fresh home"
        >
          {logoFailed ? (
            'KF'
          ) : (
            <img
              alt="K-Fresh"
              className="h-full w-full object-cover"
              src="/k-logo.png"
              onError={() => setLogoFailed(true)}
            />
          )}
        </Link>
        <nav className="flex justify-center gap-[30px] max-lg:hidden" aria-label="Primary navigation">
          <Link href={ROUTES.home}>New & Featured</Link>
          <Link href={ROUTES.profile}>Men</Link>
          <Link href={ROUTES.profile}>Women</Link>
          <Link href={ROUTES.profile}>Kids</Link>
          {user?.role === 'ADMIN' ? <Link href={ROUTES.admin}>Admin</Link> : null}
        </nav>
        <nav className="flex items-center justify-end gap-[18px] max-lg:col-start-2 max-sm:gap-2" aria-label="Account navigation">
          <Link
            className="inline-flex min-h-10 min-w-[180px] items-center justify-start gap-2.5 rounded-full bg-[#f5f5f5] px-[18px] py-2 text-[#39393b] max-sm:min-w-11 max-sm:px-3.5"
            href={ROUTES.profile}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 shrink-0 stroke-[#111111] stroke-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M16 16L21 21" />
            </svg>
            <span className="max-sm:hidden">Search</span>
          </Link>
          {user ? (
            <div className="relative">
              <button
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-[#111111] px-3 text-sm font-medium text-white"
                type="button"
                onClick={() => setIsProfileOpen((current) => !current)}
                aria-expanded={isProfileOpen}
                aria-label="Open profile menu"
              >
                {initials}
              </button>
              {isProfileOpen ? (
                <div className="toast-enter absolute right-0 top-12 z-20 w-72 border border-[#cacacb] bg-white p-5">
                  <div className="border-b border-[#cacacb] pb-4">
                    <p className="text-base font-medium text-[#111111]">{userLabel}</p>
                    <p className="mt-1 text-sm text-[#707072]">{user.email}</p>
                    <span className="mt-3 inline-flex rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-[#111111]">
                      {user.role}
                    </span>
                  </div>
                  <div className="grid gap-3 py-4 text-base font-medium text-[#111111]">
                    <Link href={ROUTES.profile} onClick={() => setIsProfileOpen(false)}>
                      Profile
                    </Link>
                    {user.role === 'ADMIN' ? (
                      <Link href={ROUTES.admin} onClick={() => setIsProfileOpen(false)}>
                        Admin dashboard
                      </Link>
                    ) : null}
                  </div>
                  <button
                    className="w-full rounded-full bg-[#111111] px-5 py-3 text-base font-medium text-white"
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      void logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link className="text-base font-medium text-[#111111]" href={ROUTES.login}>
              Login
            </Link>
          )}
        </nav>
      </header>
    </>
  );
};
