import apiClient from '../apiClient';
import type {
  BookingActionResponse,
  CreateBookingInput,
  GetBookingsResponse,
} from './types';

export const getBookingsApi = async (): Promise<GetBookingsResponse> => {
  return apiClient<GetBookingsResponse>('/api/bookings', {
    method: 'GET',
  });
};

export const createBookingApi = async (
  booking: CreateBookingInput
): Promise<BookingActionResponse> => {
  return apiClient<BookingActionResponse>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  });
};

export const acceptBookingApi = async (
  bookingId: number
): Promise<BookingActionResponse> => {
  return apiClient<BookingActionResponse>(`/api/bookings/${bookingId}/accept`, {
    method: 'PATCH',
  });
};

export const rejectBookingApi = async (
  bookingId: number
): Promise<BookingActionResponse> => {
  return apiClient<BookingActionResponse>(`/api/bookings/${bookingId}/reject`, {
    method: 'PATCH',
  });
};
