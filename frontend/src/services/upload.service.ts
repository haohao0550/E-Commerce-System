import { apiClient } from '@/services/api-client';

export const uploadService = {
  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await apiClient<{ images: string[] }>('/upload/images', {
      method: 'POST',
      body: formData,
      auth: true,
    });
    return response.data.images;
  },
};
