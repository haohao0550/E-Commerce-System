import axios from 'axios';
import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from '@/constants/api';
import type { ApiResponse } from '@/types/api';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
}

/**
 * Custom Error wrapper for all API client request failures.
 * Maps backend error payloads containing status codes, codes, and details.
 */
export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Retrieve the active session JWT token from LocalStorage.
 * Safe to call in both SSR and Client-side environments.
 */
const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

/**
 * Save a newly issued session JWT token to LocalStorage.
 */
export const setAccessToken = (token: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

/**
 * Remove the active session JWT token from LocalStorage.
 */
export const clearAccessToken = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

/**
 * Core API Client Wrapper using Axios.
 * Implements automated session token injection, cookie-based credentials,
 * custom FormData multipart headers bypass, and uniform error mapping.
 */
export const apiClient = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Dynamically configure Content-Type depending on body structure
  if (options.body !== undefined) {
    if (!(options.body instanceof FormData)) {
      // Use JSON encoding for standard objects
      headers['Content-Type'] = 'application/json';
    }
    // For FormData instances (file uploads), headers are skipped to let Axios configure boundary boundaries
  }

  // Automatically inject active Authorization Bearer Token if needed
  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await axios({
      url: `${API_BASE_URL}${path}`,
      method: options.method || 'GET',
      headers,
      data: options.body,
      withCredentials: true,
    });

    const payload = response.data as ApiResponse<T>;
    if (!payload) {
      throw new ApiClientError('Invalid server response', response.status || 200);
    }
    return payload;
  } catch (error) {
    // Map standard Axios errors into custom descriptive ApiClientError structure
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const payload = error.response?.data as ApiResponse<T> | null;
      throw new ApiClientError(
        payload?.message || error.message || 'Request failed',
        status,
        payload?.error?.code,
        payload?.error?.details,
      );
    }
    throw error;
  }
};

