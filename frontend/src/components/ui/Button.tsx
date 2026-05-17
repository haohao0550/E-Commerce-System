import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button = ({ children, className = '', variant = 'primary', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-[#111111] text-white border-transparent active:scale-[0.98] active:opacity-50',
    secondary: 'bg-[#f5f5f5] text-[#111111] border-transparent',
    danger: 'bg-[#111111] text-white border-transparent',
    ghost: 'bg-white text-[#111111] border-[#cacacb]',
  };

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3 text-base font-medium leading-6 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
