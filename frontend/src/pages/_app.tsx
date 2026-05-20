import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AddressProvider } from '@/context/AddressContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import '@/index.css';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pathname = router.pathname || '';
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      <Head>
        <title>K-Fresh E-Commerce</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Mini e-commerce frontend" />
      </Head>
      {isAdminRoute ? (
        <div className="min-h-screen bg-surface-base">
          <Component {...pageProps} />
        </div>
      ) : (
        <div className="app-shell flex flex-col min-h-screen">
          <Header />
          <div className="flex-1">
            <Component {...pageProps} />
          </div>
          <Footer />
        </div>
      )}
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AddressProvider>
          <CartProvider>
            <AppContent {...props} />
          </CartProvider>
        </AddressProvider>
      </AuthProvider>
    </ToastProvider>
  );
}


