export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: number;
  walker_id: number;
  dog_id: number;
  booking_date: string;
  duration_hours: number | string;
  total_price: number | string;
  status: BookingStatus;
  walker_name?: string;
  dog_name?: string;
  created_at?: string;
}

export interface CreateBookingInput {
  walker_id: number;
  dog_id: number;
  booking_date: string;
  duration_hours: number;
}

export interface GetBookingsResponse {
  status: string;
  count: number;
  data: Booking[];
}

export interface BookingActionResponse {
  status: string;
  message: string;
  data: Booking;
}
