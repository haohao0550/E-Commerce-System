import { FormEvent, useState, ReactNode } from 'react';
import { ArrowRight, Apple, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ROUTES } from '@/routes';
import { StatusMessage } from '@/components/common/StatusMessage';

const InputField = ({ label, id, name, type = 'text', placeholder, rightLabel, required }: {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  rightLabel?: ReactNode;
  required?: boolean;
}) => (
  <div className="w-full">
    <div className="mb-2 flex justify-between">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-primary">
        {label}
      </label>
      {rightLabel}
    </div>
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="w-full border-b-2 border-outline-variant bg-transparent py-3 text-lg font-medium transition-all duration-300 placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
    />
  </div>
);

export const LoginForm = () => {
  const { login } = useAuth();
  const { error, isSubmitting, run } = useAsyncAction();
  const [rememberMe, setRememberMe] = useState(false);

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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
        Welcome Back
      </h1>
      <p className="mb-10 text-on-surface-variant">
        Log in to access your drops and exclusive releases.
      </p>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <InputField 
          label="Email Address" 
          id="email" 
          name="email"
          required
          placeholder="sneakerhead@shopkicks.com" 
        />
        <InputField 
          label="Password" 
          id="password" 
          name="password"
          type="password" 
          required
          placeholder="••••••••" 
          rightLabel={
            <Link href="#" className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant underline underline-offset-4 hover:text-primary transition-colors">
              Forgot?
            </Link>
          }
        />

        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id="remember" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded-sm border-outline-variant bg-surface-container text-primary transition-all focus:ring-primary"
          />
          <label htmlFor="remember" className="text-sm font-medium text-on-surface-variant">
            Keep me logged in
          </label>
        </div>

        <StatusMessage message={error} tone="error" />

        <motion.button 
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.96 }}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold tracking-widest text-on-primary transition-all hover:bg-on-surface disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
          {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
        </motion.button>
      </form>

      <div className="my-10 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-outline-variant/30" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
          Or continue with
        </span>
        <div className="h-[1px] flex-1 bg-outline-variant/30" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button type="button" className="flex items-center justify-center gap-2 rounded-full border-2 border-outline-variant py-3 text-xs font-bold tracking-widest transition-all hover:border-primary">
          <LogIn size={16} /> GOOGLE
        </button>
        <button type="button" className="flex items-center justify-center gap-2 rounded-full border-2 border-outline-variant py-3 text-xs font-bold tracking-widest transition-all hover:border-primary">
          <Apple size={16} /> APPLE
        </button>
      </div>

      <p className="mt-10 text-center text-sm font-medium text-on-surface-variant">
        Don't have an account?{' '}
        <Link href={ROUTES.register} className="font-bold text-primary underline underline-offset-4 transition-colors hover:text-on-surface">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
};

