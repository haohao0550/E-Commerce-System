export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    price: string | number;
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      basePrice: string | number;
    };
  };
}

export interface CartResponse {
  items: CartItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AddToCartPayload {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
