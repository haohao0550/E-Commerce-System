import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { authService } from '@/services/auth.service';
import type { LoginPayload, RegisterPayload } from '@/services/auth.service';
import { userService } from '@/features/users/services/user.service';
import { clearAccessToken } from '@/services/api-client';
import { ROUTES } from '@/routes';
import type { User } from '@/features/users/types/user';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    const profile = await userService.getProfile();
    setUser(profile);
  };

  useEffect(() => {
    refreshProfile()
      .catch(() => {
        clearAccessToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async login(payload) {
        const result = await authService.login(payload);
        setUser(result.user);
        showToast('Signed in successfully', 'success');
        router.push(result.user.role === 'ADMIN' ? ROUTES.admin : ROUTES.home);
      },
      async register(payload) {
        const result = await authService.register(payload);
        setUser(result.user);
        showToast('Account created successfully', 'success');
        router.push(ROUTES.home);
      },
      async logout() {
        try {
          await authService.logout();
        } finally {
          clearAccessToken();
          setUser(null);
          showToast('Signed out', 'info');
          router.push(ROUTES.login);
        }
      },
      refreshProfile,
    }),
    [isLoading, router, showToast, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

