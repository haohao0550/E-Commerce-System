import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppHeader } from '@/layouts/AppHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'K-Fresh E-Commerce',
  description: 'Mini e-commerce frontend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <div className="app-shell">
              <AppHeader />
              {children}
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
