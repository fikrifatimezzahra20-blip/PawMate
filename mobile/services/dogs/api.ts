import apiClient from '../apiClient';
import type {
  CreateDogInput,
  CreateDogResponse,
  GetDogsResponse,
} from './types';

export const getDogsApi = async (): Promise<GetDogsResponse> => {
  return apiClient<GetDogsResponse>('/api/dogs', {
    method: 'GET',
  });
};

export const createDogApi = async (
  dog: CreateDogInput
): Promise<CreateDogResponse> => {
  return apiClient<CreateDogResponse>('/api/dogs', {
    method: 'POST',
    body: JSON.stringify(dog),
  });
};
