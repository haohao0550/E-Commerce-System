import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { productService } from '@/features/products/services/product.service';
import { uploadService } from '@/services/upload.service';
import type { Product } from '@/features/products/types/product';
import type { Category } from '@/features/categories/types/category';
import type { CreateProductPayload, UpdateProductPayload } from '@/types/product';
import { useToast } from '@/context/ToastContext';

interface ProductFormModalProps {
  open: boolean;
  categories: Category[];
  initialProduct?: Product | null;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

export const ProductFormModal = ({
  open,
  categories,
  initialProduct = null,
  onClose,
  onSuccess,
}: ProductFormModalProps) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialProduct;

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setDescription(initialProduct.description || '');
      setBasePrice(String(initialProduct.basePrice ?? ''));
      setCategoryId(initialProduct.categoryId || '');
      setExistingImages(initialProduct.images || []);
      setSelectedFiles([]);
    } else {
      setName('');
      setDescription('');
      setBasePrice('');
      setCategoryId('');
      setExistingImages([]);
      setSelectedFiles([]);
    }
  }, [initialProduct, open]);

  const hasNewImages = selectedFiles.length > 0;
  const previewImages = useMemo(() => {
    if (hasNewImages) {
      return selectedFiles.map((file) => URL.createObjectURL(file));
    }
    return existingImages;
  }, [existingImages, hasNewImages, selectedFiles]);

  useEffect(() => {
    if (!hasNewImages) return undefined;
    return () => {
      previewImages.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [hasNewImages, previewImages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    const priceNumber = Number(basePrice);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      showToast('Base price must be a valid number', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedImages = hasNewImages ? await uploadService.uploadImages(selectedFiles) : null;

      if (isEditMode && initialProduct) {
        const payload: UpdateProductPayload = {
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: priceNumber,
          categoryId: categoryId || undefined,
          images: uploadedImages ?? existingImages,
        };
        const updated = await productService.updateProduct(initialProduct.id, payload);
        showToast('Product updated successfully', 'success');
        onSuccess(updated);
      } else {
        const payload: CreateProductPayload = {
          name: name.trim(),
          description: description.trim() || undefined,
          basePrice: priceNumber,
          categoryId: categoryId || undefined,
          images: uploadedImages ?? undefined,
        };
        const created = await productService.createProduct(payload);
        showToast('Product created successfully', 'success');
        onSuccess(created);
      }
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save product';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg md:p-8">
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
            {isEditMode ? 'Edit Product' : 'Create Product'}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {isEditMode ? 'Update product details and inventory metadata.' : 'Add a new product to your catalog.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Product Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="Nike Air Max 90"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Base Price</label>
              <input
                value={basePrice}
                onChange={(event) => setBasePrice(event.target.value.replace(/\D/g, ''))}
                disabled={isSubmitting}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                placeholder="1200000"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-on-surface">Category</label>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-on-surface">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                setSelectedFiles(files);
              }}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
            <p className="mt-1 text-xs text-on-surface-variant">
              Upload up to 3 images. If you don’t select new images, existing images remain.
            </p>
            {previewImages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {previewImages.map((src, index) => (
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt="preview"
                    className="h-20 w-full rounded-lg object-cover border border-surface-container-high"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-on-surface">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              placeholder="Product highlights, materials, sizing..."
            />
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
