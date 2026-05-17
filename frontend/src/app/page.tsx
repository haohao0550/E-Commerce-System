import Link from 'next/link';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/constants/routes';
import { ProductCard } from '@/features/products/ProductCard';
import { featuredProducts, sportTiles } from '@/features/products/product-data';

export default function HomePage() {
  return (
    <main>
      <section className="campaign-hero">
        <img
          alt="Runner in motion"
          className="campaign-image"
          src="https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1800&q=85"
        />
        <div className="campaign-copy">
          <h1>RUN READY</h1>
          <Link className="pill-link pill-on-image" href={ROUTES.register}>
            Join Us
          </Link>
        </div>
      </section>

      <section className="page commerce-section">
        <Reveal>
          <div className="section-heading">
            <h2>Featured footwear</h2>
            <Link href={ROUTES.login}>Sign In</Link>
          </div>
        </Reveal>
        <div className="product-grid">
          {featuredProducts.map((product, index) => (
            <Reveal delay={index * 80} key={product.id}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page commerce-section">
        <Reveal>
          <div className="section-heading">
            <h2>Shop by sport</h2>
          </div>
        </Reveal>
        <div className="sport-grid">
          {sportTiles.map((tile, index) => (
            <Reveal delay={index * 90} key={tile.title}>
              <article className="sport-tile">
                <img alt={tile.title} src={tile.image} />
                <Link className="pill-link pill-on-image" href={ROUTES.register}>
                  {tile.title}
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
