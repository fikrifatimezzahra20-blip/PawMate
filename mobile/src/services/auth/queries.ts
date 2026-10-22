import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { getMeApi, loginApi, registerApi, logoutApi } from './api';
import type {
  AuthResponse,
  GetMeResponse,
  LoginRequest,
  RegisterRequest,
} from './types';
import { getAuthToken } from '../apiClient';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export const useLoginMutation = (
  options?: UseMutationOptions<AuthResponse, Error, LoginRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: loginApi,
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.setQueryData(authKeys.me(), { user: data.user });
      (options?.onSuccess as any)?.(data, variables, context, ...rest);
    },
  });
};

export const useRegisterMutation = (
  options?: UseMutationOptions<AuthResponse, Error, RegisterRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: registerApi,
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.setQueryData(authKeys.me(), { user: data.user });
      (options?.onSuccess as any)?.(data, variables, context, ...rest);
    },
  });
};

export const useCurrentUserQuery = (
  options?: Omit<UseQueryOptions<GetMeResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMeApi,
    enabled: !!getAuthToken(),
    ...options,
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
