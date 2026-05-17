interface ProductCardProps {
  product: {
    name: string;
    category: string;
    price: string;
    salePrice?: string;
    image: string;
    colors: string[];
    badge?: string;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.badge ? <span className="badge-promo">{product.badge}</span> : null}
        <img alt={product.name} className="product-image" src={product.image} />
      </div>
      <div className="swatch-row" aria-label="Available colors">
        {product.colors.map((color) => (
          <span key={color} className="swatch-dot" style={{ backgroundColor: color }} />
        ))}
      </div>
      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <div className="price-row">
        {product.salePrice ? (
          <>
            <strong className="sale-price">{product.salePrice}</strong>
            <span className="original-price">{product.price}</span>
          </>
        ) : (
          <strong>{product.price}</strong>
        )}
      </div>
    </article>
  );
};
