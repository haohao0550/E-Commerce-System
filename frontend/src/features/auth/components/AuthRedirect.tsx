import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/routes';
import type { ReactNode } from 'react';

export const AuthRedirect = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === 'ADMIN' ? ROUTES.admin : ROUTES.home);
    }
  }, [isLoading, router, user]);

  if (isLoading || user) {
    return <PageLoader label="Checking session" />;
  }

  return <>{children}</>;
};

