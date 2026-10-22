import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  acceptBookingApi,
  createBookingApi,
  getBookingsApi,
  rejectBookingApi,
} from './api';
import type {
  BookingActionResponse,
  CreateBookingInput,
  GetBookingsResponse,
} from './types';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
};

export const useBookingsQuery = (
  options?: Omit<
    UseQueryOptions<GetBookingsResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: getBookingsApi,
    ...options,
  });
};

export const useCreateBookingMutation = (
  options?: UseMutationOptions<
    BookingActionResponse,
    Error,
    CreateBookingInput
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createBookingApi,
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      (options?.onSuccess as any)?.(data, variables, context, ...rest);
    },
  });
};

export const useAcceptBookingMutation = (
  options?: UseMutationOptions<BookingActionResponse, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: acceptBookingApi,
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      (options?.onSuccess as any)?.(data, variables, context, ...rest);
    },
  });
};

export const useRejectBookingMutation = (
  options?: UseMutationOptions<BookingActionResponse, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: rejectBookingApi,
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      (options?.onSuccess as any)?.(data, variables, context, ...rest);
    },
  });
};
