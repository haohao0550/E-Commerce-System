import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { productVariantService } from '@/features/products/services/product-variant.service';
import type { ProductVariant } from '@/features/products/types/product';
import type { CreateProductVariantPayload, UpdateProductVariantPayload } from '@/types/product-variant';
import { useToast } from '@/context/ToastContext';

interface ProductVariantModalProps {
  open: boolean;
  productId: string;
  initialVariant?: ProductVariant | null;
  onClose: () => void;
  onSuccess: (variant: ProductVariant) => void;
}

export const ProductVariantModal = ({
  open,
  productId,
  initialVariant = null,
  onClose,
  onSuccess,
}: ProductVariantModalProps) => {
  const { showToast } = useToast();
  const colorOptions = ['Yellow', 'Red', 'Green', 'Blue', 'Black', 'White', 'Gray', 'Orange', 'Purple', 'Pink', 'Brown'];
  const [sku, setSku] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialVariant;

  useEffect(() => {
    if (initialVariant) {
      setSku(initialVariant.sku || '');
      setColor(initialVariant.color || '');
      setSize(initialVariant.size || '');
      setPrice(String(initialVariant.price ?? ''));
      setStock(String(initialVariant.stock ?? ''));
    } else {
      setSku('');
      setColor('');
      setSize('');
      setPrice('');
      setStock('');
    }
  }, [initialVariant, open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sku.trim()) {
      showToast('SKU is required', 'error');
      return;
    }

    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      showToast('Price must be a valid number', 'error');
      return;
    }

    const stockNumber = stock === '' ? undefined : Number(stock);
    if (stock !== '' && (Number.isNaN(stockNumber) || (stockNumber ?? 0) < 0)) {
      showToast('Stock must be a valid number', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode && initialVariant) {
        const payload: UpdateProductVariantPayload = {
          sku: sku.trim(),
          color: color.trim() ? color.trim() : null,
          size: size.trim() ? size.trim() : null,
          price: priceNumber,
          stock: stockNumber,
        };
        const updated = await productVariantService.updateVariant(initialVariant.id, payload);
        showToast('Variant updated successfully', 'success');
        onSuccess(updated);
      } else {
        const payload: CreateProductVariantPayload = {
          sku: sku.trim(),
          color: color.trim() || undefined,
          size: size.trim() || undefined,
          price: priceNumber,
          stock: stockNumber,
        };
        const created = await productVariantService.createVariant(productId, payload);
        showToast('Variant created successfully', 'success');
        onSuccess(created);
      }

      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save variant';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg md:p-8">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-on-surface">
            {isEditMode ? 'Edit Variant' : 'Create Variant'}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {isEditMode ? 'Update SKU, price, and stock details.' : 'Add a new variant for this product.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-on-surface">SKU</label>
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              placeholder="SKU-001"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Color</label>
                <select
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="">No color</option>
                  {colorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Size</label>
              <input
                value={size}
                onChange={(event) => setSize(event.target.value.replace(/\D/g, ''))}
                disabled={isSubmitting}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="42"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Price</label>
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value.replace(/\D/g, ''))}
                disabled={isSubmitting}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="1800000"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Stock</label>
              <input
                value={stock}
                onChange={(event) => setStock(event.target.value.replace(/\D/g, ''))}
                disabled={isSubmitting}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-brand-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Variant' : 'Create Variant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
