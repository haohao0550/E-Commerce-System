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

// Track refresh token requests to prevent race conditions
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

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
 * Refresh the access token using the backend refresh endpoint.
 * Handles concurrent refresh requests to prevent race conditions.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  // If already refreshing, wait for the existing refresh promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const response = await axios.post<ApiResponse<{ accessToken: string }>>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken = response.data?.data?.accessToken;
      if (newToken) {
        setAccessToken(newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      clearAccessToken();
      // Redirect to login on refresh failure
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Core API Client Wrapper using Axios.
 * Implements automated session token injection, cookie-based credentials,
 * custom FormData multipart headers bypass, uniform error mapping,
 * and automatic token refresh on 401 responses.
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

      // Handle 401 Unauthorized - attempt token refresh
      if (status === 401 && options.auth !== false && typeof window !== 'undefined') {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry the original request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          try {
            const retryResponse = await axios({
              url: `${API_BASE_URL}${path}`,
              method: options.method || 'GET',
              headers,
              data: options.body,
              withCredentials: true,
            });

            const retryPayload = retryResponse.data as ApiResponse<T>;
            if (!retryPayload) {
              throw new ApiClientError('Invalid server response', retryResponse.status || 200);
            }
            return retryPayload;
          } catch (retryError) {
            if (axios.isAxiosError(retryError)) {
              const retryStatus = retryError.response?.status || 500;
              const retryPayload = retryError.response?.data as ApiResponse<T> | null;
              throw new ApiClientError(
                retryPayload?.message || retryError.message || 'Request failed',
                retryStatus,
                retryPayload?.error?.code,
                retryPayload?.error?.details,
              );
            }
            throw retryError;
          }
        }
      }

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

