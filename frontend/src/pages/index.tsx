import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Diamond } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROUTES } from '@/routes';
import { productService } from '@/features/products/services/product.service';
import type { Product } from '@/features/products/types/product';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = () => {
    setIsLoading(true);
    setError(null);
    productService.getProducts({ limit: 6 })
      .then((res) => {
        setProducts(res.products || []);
      })
      .catch((err) => {
        console.error('Failed to fetch products', err);
        setError('Could not load products. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const defaultImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-surface-lowest flex flex-col font-sans overflow-x-hidden">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKeI-bsmnso-IbLcikusrF2x3h7lEnPeK8D6ECjAeRxh16gUSTEk4p0ppYtkLxzu1CwKdY3pWjhYQNG4kZAI5fiMz0oEtZ1rz2EUY6Ya-q7dw8zHGJmDh2w3wFyDLhHTapX9kRR3wgpKluj5O_zkGffcjG125PIIFPr-XGrIsn0h69Eb621Tqdy3iflXG8fXamS1-ec_TepJq1vAziZE0RhuSeJXTjG4naGWIvq1k147Y5j31XI_a8c2ikXaTGFNFOKlGNAgnaXuE" 
              alt="Performance Sneaker"
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-transparent to-transparent" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-10 text-center px-6 max-w-4xl"
          >
            <span className="inline-block px-4 py-1 border border-black/20 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-sm bg-white/10 text-black">
              Latest Drop
            </span>
            <h1 className="text-5xl md:text-8xl font-display font-black leading-[0.95] uppercase tracking-tighter text-black mb-8">
              The Next Step <br /> In Speed
            </h1>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-black text-white px-10 py-4 font-bold uppercase tracking-widest text-xs rounded hover:bg-black/90 transition-colors"
            >
              Shop New Drops
            </motion.button>
          </motion.div>
        </section>

        {/* New Arrivals */}
        <section id="new-arrivals" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
          <div className="flex items-end justify-between mb-12 border-b border-surface-highest pb-8">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-black tracking-tight uppercase">New Arrivals</h2>
            <Link href={ROUTES.products} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-black kinetic-transition">
              View All <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>

          {isLoading ? (
            /* Premium Shimmer Skeleton loading state */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="aspect-[3/4] bg-surface-container rounded-lg mb-6" />
                  <div className="h-6 bg-surface-container rounded w-2/3 mb-2" />
                  <div className="h-4 bg-surface-container rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Styled error state with retry */
            <div className="text-center py-16 border border-dashed border-outline-variant/30 rounded-2xl bg-white p-8">
              <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
              <button 
                type="button" 
                onClick={fetchProducts}
                className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold tracking-widest text-white hover:bg-on-surface transition-all active:scale-95 duration-300 shadow-sm"
                style={{ color: '#ffffff' }}
              >
                RETRY LOADING
              </button>
            </div>
          ) : products.length === 0 ? (
            /* Empty state if database has no products */
            <div className="text-center py-20 border border-dashed border-outline-variant/30 rounded-2xl bg-white p-10">
              <p className="text-base font-bold text-on-surface-variant mb-2">NO PRODUCTS FOUND</p>
              <p className="text-xs text-on-surface-variant/70 font-medium mb-6">Our upcoming drops are currently under wrap. Stay tuned!</p>
            </div>
          ) : (
            /* Render active products in Database */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {products.map((product, index) => {
                const mainImage = product.images?.[0] || defaultImage;
                return (
                  <Link href={`/products/${product.id}`} key={product.id} className="block group">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative aspect-[3/4] bg-surface-low rounded-lg overflow-hidden mb-6">
                        <img 
                          src={mainImage} 
                          alt={product.name}
                          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-xl font-display font-bold text-black mb-1">{product.name}</h3>
                      <p className="text-on-surface-variant font-medium">${Number(product.basePrice).toFixed(2)}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Trending Collections */}
        <section id="trending" className="max-w-7xl mx-auto px-6 md:px-10 py-24 bg-surface-lowest">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-black tracking-tight uppercase mb-12">Trending Collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[700px]">
            {/* Primary Large Card */}
            <div className="md:col-span-3 md:row-span-2 relative group overflow-hidden rounded-xl bg-black min-h-[400px]">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbhXtWSh-3h0tO2TEehtDZywwdZofpZzQtAIL35bXR9efQyLAMTuE5-yv0PtMjagsqWMB836-aqzaS0yHIp7ct_r0f62cW0tnDdoMfAQPX2hWt287ou0IrJJHkVrznuypKFzPkf9BbbPuo36s7YXx8l5kwLvXRz_Iscco8pdVHskZ6mHDu_qVbDG9_-GSCe7u7Yil4JsxunemjmrfIEkuNRwzQ_z_KJz9x6o_SG5D2mzac96UoJ3twvGSGZM00IrMiyxN-TscLqIc" 
                alt="Nocturne Series"
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 kinetic-transition"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-2">Collection</p>
                  <h3 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter">Nocturne Series</h3>
                </div>
                <button className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-black hover:bg-black hover:text-white kinetic-transition border border-white">
                  <ArrowRight size={24} />
                </button>
              </div>
            </div>

            {/* Secondary Top Card */}
            <div className="md:col-span-1 relative group overflow-hidden rounded-xl bg-surface-high min-h-[300px]">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4KcdAFHPq2pD0rM2xepiKPRrPR2vLT-lMMK8az4hkyfznqQQF5ZEcU1wkrN3jWnxwERNHTO9vn5xNzV6EgAtkDvSJ2EaFTB7XmWHq-dMWZ7gs2x5L9cHZjksAMaTPDp0oSjlfnTZryGNmqswMyk-bqxd2yZ37gjSzTqAjfEjxCQzdRS7nmO7Ajb0jCgvkBhnoFAS5vDjtNywZ8pEuxUTxbOc7y1rCFWB9XYAbNgrXrNRrnd83jYxEIYtqlCY5lqdfI_oT9Z1qDJo" 
                alt="Performance"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 kinetic-transition grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-display font-bold text-white uppercase">Performance Core</h3>
              </div>
            </div>

            {/* Archives Info Card */}
            <div className="md:col-span-1 relative bg-surface-low rounded-xl border border-surface-highest flex flex-col items-center justify-center text-center p-8 transition-colors hover:bg-surface-high">
              <div className="mb-6 h-12 w-12 rounded-full border border-black/10 flex items-center justify-center">
                <Diamond size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-display font-bold text-black uppercase mb-3">The Archive</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                Explore rare and sold-out grails from past seasons.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

