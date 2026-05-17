'use client';

import Link from 'next/link';
import { PageLoader } from '@/components/common/PageLoader';
import { Reveal } from '@/components/common/Reveal';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

export default function AdminPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader label="Loading admin dashboard" />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page py-12">
        <h1 className="page-title">Admin access required</h1>
        <p className="page-subtitle">Sign in with an administrator account to manage users.</p>
        <Link className="pill-link bg-[#111111] text-white" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="page py-12">
      <h1 className="page-title">Admin dashboard</h1>
      <p className="page-subtitle">Operational controls for users and account lifecycle.</p>

      <section className="grid gap-2 md:grid-cols-3">
        <Reveal>
          <Link className="block border border-[#cacacb] bg-white p-6" href={ROUTES.adminUsers}>
            <span className="mb-8 inline-flex rounded-full bg-[#111111] px-3 py-1 text-xs font-medium text-white">Live</span>
            <h2 className="text-2xl font-medium uppercase leading-tight">Users</h2>
            <p className="mt-3 text-sm leading-6 text-[#707072]">
              List accounts, filter status, change roles, soft delete, and restore users.
            </p>
          </Link>
        </Reveal>
        <Reveal delay={90}>
          <div className="border border-[#cacacb] bg-[#f5f5f5] p-6">
            <span className="mb-8 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-[#707072]">Next</span>
            <h2 className="text-2xl font-medium uppercase leading-tight">Products</h2>
            <p className="mt-3 text-sm leading-6 text-[#707072]">Ready for the product module when backend APIs are added.</p>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="border border-[#cacacb] bg-[#f5f5f5] p-6">
            <span className="mb-8 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-[#707072]">Next</span>
            <h2 className="text-2xl font-medium uppercase leading-tight">Orders</h2>
            <p className="mt-3 text-sm leading-6 text-[#707072]">Ready for order management once the endpoints are available.</p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
