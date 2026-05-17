'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  title: string;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info', title?: string) => {
      const id = Date.now();
      const defaultTitle = tone === 'success' ? 'Success' : tone === 'error' ? 'Action failed' : 'Notice';
      setToasts((current) => [...current, { id, message, tone, title: title || defaultTitle }]);
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-5 top-5 z-50 grid w-[min(390px,calc(100vw-40px))] gap-3">
        {toasts.map((toast) => (
          <div
            className={`toast-enter overflow-hidden rounded-[24px] border bg-white shadow-[0_18px_45px_rgba(17,17,17,0.12)] ${
              toast.tone === 'success'
                ? 'border-[#007d48]'
                : toast.tone === 'error'
                  ? 'border-[#d30005]'
                  : 'border-[#cacacb]'
            }`}
            key={toast.id}
          >
            <div className="flex gap-3 px-4 py-3">
              <span
                className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  toast.tone === 'success'
                    ? 'bg-[#007d48] text-white'
                    : toast.tone === 'error'
                      ? 'bg-[#d30005] text-white'
                      : 'bg-[#111111] text-white'
                }`}
              >
                {toast.tone === 'success' ? '✓' : toast.tone === 'error' ? '!' : 'i'}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111111]">{toast.title}</p>
                <p className="mt-1 text-sm leading-5 text-[#707072]">{toast.message}</p>
              </div>
              <button
                className="ml-auto h-7 w-7 shrink-0 rounded-full bg-[#f5f5f5] text-sm font-medium text-[#111111]"
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
            <div
              className={`toast-progress h-1 ${
                toast.tone === 'success' ? 'bg-[#007d48]' : toast.tone === 'error' ? 'bg-[#d30005]' : 'bg-[#111111]'
              }`}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};
