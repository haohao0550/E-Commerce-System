'use client';

import Link from 'next/link';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuth } from '@/contexts/AuthContext';
import { AdminUsersTable } from '@/features/users/components/AdminUsersTable';
import { ROUTES } from '@/constants/routes';

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader label="Loading users" />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page py-12">
        <h1 className="page-title">Admin access required</h1>
        <p className="page-subtitle">This page is only available for administrator accounts.</p>
        <Link className="pill-link bg-[#111111] text-white" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="page py-12">
      <h1 className="page-title">Admin users</h1>
      <p className="page-subtitle">Manage user roles, deleted accounts, and account restoration.</p>
      <AdminUsersTable />
    </main>
  );
}
