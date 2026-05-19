'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/api-error';

export const useAsyncAction = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const run = async (action: () => Promise<void>, successMessage?: string) => {
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      await action();
      if (successMessage) {
        setMessage(successMessage);
        showToast(successMessage, 'success');
      }
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, message, run };
};

