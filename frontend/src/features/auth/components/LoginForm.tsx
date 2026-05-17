'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusMessage } from '@/components/common/StatusMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ROUTES } from '@/constants/routes';

export const LoginForm = () => {
  const { login } = useAuth();
  const { error, isSubmitting, run } = useAsyncAction();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
      return;
    }

    void run(async () => {
      await login({
        email,
        password,
      });
    });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <Input label="Email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
      <Input
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        required
        minLength={6}
        autoComplete="current-password"
      />
      <label className="inline-flex items-center gap-2 text-sm font-medium text-[#707072]">
        <input
          className="h-4 w-4 accent-[#111111]"
          type="checkbox"
          checked={showPassword}
          onChange={(event) => setShowPassword(event.target.checked)}
        />
        Show password
      </label>
      <StatusMessage message={error} tone="error" />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
      <p className="form-note">
        No account? <Link href={ROUTES.register}>Create one</Link>
      </p>
    </form>
  );
};
