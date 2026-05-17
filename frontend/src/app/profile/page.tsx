'use client';

import Link from 'next/link';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { ChangePasswordForm } from '@/features/users/components/ChangePasswordForm';
import { DeleteAccountPanel } from '@/features/users/components/DeleteAccountPanel';
import { ProfileForm } from '@/features/users/components/ProfileForm';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader label="Loading profile" />;
  }

  if (!user) {
    return (
      <main className="page py-12">
        <h1 className="page-title">Sign in required</h1>
        <p className="page-subtitle">Please sign in to view and manage your profile.</p>
        <Link className="pill-link bg-[#111111] text-white" href={ROUTES.login}>
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="page py-12">
      <h1 className="page-title">My profile</h1>
      <p className="page-subtitle">Update your account information and password.</p>
      <section className="profile-grid">
        <div className="panel">
          <h2>Profile information</h2>
          <ProfileForm />
        </div>
        <div className="panel">
          <h2>Password</h2>
          <ChangePasswordForm />
        </div>
        <div className="panel">
          <h2>Account deletion</h2>
          <DeleteAccountPanel />
        </div>
      </section>
    </main>
  );
}
