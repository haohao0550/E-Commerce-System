import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, id, className = '', ...props }: InputProps) => {
  const inputId = id || props.name;

  return (
    <label className="grid gap-2" htmlFor={inputId}>
      <span className="text-sm font-medium text-[#111111]">{label}</span>
      <input
        id={inputId}
        className={`min-h-11 w-full rounded-full border border-transparent bg-[#f5f5f5] px-4 py-2.5 text-[#111111] outline-none focus:border-2 focus:border-[#111111] focus:bg-white focus:ring-[12px] focus:ring-[#f5f5f5] ${className}`}
        {...props}
      />
    </label>
  );
};

