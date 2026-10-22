import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { createDogApi, getDogsApi } from './api';
import type {
  CreateDogInput,
  CreateDogResponse,
  GetDogsResponse,
} from './types';

export const dogKeys = {
  all: ['dogs'] as const,
  lists: () => [...dogKeys.all, 'list'] as const,
};

export const useDogsQuery = (
  options?: Omit<UseQueryOptions<GetDogsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: dogKeys.lists(),
    queryFn: getDogsApi,
    ...options,
  });
};

export const useCreateDogMutation = (
  options?: UseMutationOptions<CreateDogResponse, Error, CreateDogInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createDogApi,
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: dogKeys.all });
      (options?.onSuccess as any)?.(data, variables, context, ...rest);
    },
  });
};
