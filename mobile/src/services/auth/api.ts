import apiClient, { setAuthToken } from '../apiClient';
import type {
  AuthResponse,
  GetMeResponse,
  LoginRequest,
  RegisterRequest,
} from './types';

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    data,
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
};

export const registerApi = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await apiClient<AuthResponse>('/api/auth/register', {
    method: 'POST',
    data,
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
};

export const getMeApi = async (): Promise<GetMeResponse> => {
  return apiClient<GetMeResponse>('/api/auth/me', {
    method: 'GET',
  });
};

export const logoutApi = async (): Promise<void> => {
  setAuthToken(null);
};
