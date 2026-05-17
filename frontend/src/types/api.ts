export interface ApiErrorShape {
  code: string;
  details: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: ApiErrorShape;
}
