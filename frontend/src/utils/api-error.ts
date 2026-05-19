import { ApiClientError } from '@/services/api-client';

const errorMessages: Record<string, string> = {
  EMAIL_EXISTS: 'This email is already registered.',
  PHONE_EXISTS: 'This phone number is already registered.',
  DUPLICATE_FIELD: 'This information is already used by another account.',
  UNAUTHORIZED: 'Email or password is incorrect.',
  USER_DELETED: 'This account has been deleted.',
  NO_TOKEN: 'Please sign in to continue.',
  INVALID_TOKEN: 'Your session is invalid. Please sign in again.',
  SESSION_REVOKED: 'Your session has expired. Please sign in again.',
  VALIDATION_ERROR: 'Please check the form fields and try again.',
};

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) {
    return error.code ? errorMessages[error.code] || error.message : error.message;
  }

  if (error instanceof TypeError) {
    return 'Cannot connect to the server. Check that the backend is running.';
  }

  return 'Something went wrong. Please try again.';
};

