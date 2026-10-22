import {
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { getWalkerDetailsApi, getWalkersApi } from './api';
import type {
  GetWalkerDetailsResponse,
  GetWalkersResponse,
} from './types';

export const walkerKeys = {
  all: ['walkers'] as const,
  lists: () => [...walkerKeys.all, 'list'] as const,
  detail: (id: number) => [...walkerKeys.all, 'detail', id] as const,
};

export const useWalkersQuery = (
  options?: Omit<UseQueryOptions<GetWalkersResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: walkerKeys.lists(),
    queryFn: getWalkersApi,
    ...options,
  });
};

export const useWalkerDetailsQuery = (
  id: number,
  options?: Omit<
    UseQueryOptions<GetWalkerDetailsResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: walkerKeys.detail(id),
    queryFn: () => getWalkerDetailsApi(id),
    enabled: Number.isInteger(id) && id > 0,
    ...options,
  });
};
