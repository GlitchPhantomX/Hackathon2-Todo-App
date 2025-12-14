export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface CustomAxiosError extends Error {
  response?: {
    data: any;
    status: number;
    statusText: string;
    headers: any;
  };
  request?: any;
  config: any;
}