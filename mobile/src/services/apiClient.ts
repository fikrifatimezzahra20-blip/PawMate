import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

const DEFAULT_DEV_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_DEV_URL;

let currentAuthToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
};

export const getAuthToken = (): string | null => {
  return currentAuthToken;
};

export interface ApiErrorResponse {
  message?: string;
  status?: string;
  error?: string;
}

export class ApiError extends Error {
  statusCode: number;
  data?: ApiErrorResponse;

  constructor(message: string, statusCode: number, data?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (currentAuthToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentAuthToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const statusCode = error.response?.status || 500;
    const responseData = error.response?.data;
    const message =
      responseData?.message ||
      responseData?.error ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject(new ApiError(message, statusCode, responseData));
  }
);

export async function apiClient<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: any;
    body?: string;
    params?: any;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const method = options?.method || 'GET';
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let requestData = options?.data;
  if (requestData === undefined && options?.body) {
    try {
      requestData = JSON.parse(options.body);
    } catch {
      requestData = options.body;
    }
  }

  const response = await axiosInstance.request<T>({
    url,
    method,
    data: requestData,
    params: options?.params,
    headers: options?.headers,
  });

  return response.data;
}

export default apiClient;
