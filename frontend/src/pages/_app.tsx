import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AddressProvider } from '@/context/AddressContext';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import '@/index.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');

  return (
    <>
      <Head>
        <title>K-Fresh E-Commerce</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Mini e-commerce frontend" />
      </Head>
      <ToastProvider>
        <AuthProvider>
          <AddressProvider>
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
          </AddressProvider>
        </AuthProvider>
      </ToastProvider>
    </>
  );
}

