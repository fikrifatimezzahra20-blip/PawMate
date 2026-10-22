import apiClient from '../apiClient';
import type {
  GetWalkerDetailsResponse,
  GetWalkersResponse,
} from './types';

export const getWalkersApi = async (): Promise<GetWalkersResponse> => {
  return apiClient<GetWalkersResponse>('/api/walkers', {
    method: 'GET',
  });
};

export const getWalkerDetailsApi = async (
  id: number
): Promise<GetWalkerDetailsResponse> => {
  return apiClient<GetWalkerDetailsResponse>(`/api/walkers/${id}`, {
    method: 'GET',
  });
};
