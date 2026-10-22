import type { Request, Response, NextFunction } from 'express';
import {
  getAllBookings,
  createBooking,
  updateBookingStatus,
} from '../models/booking.model.js';

type AuthUser = { userId: number; role: 'owner' | 'walker' };

export const getBookings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user as AuthUser;
    const bookings = await getAllBookings(user.userId, user.role);

    res.status(200).json({
      status: 'success',
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const addBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = res.locals.user as AuthUser;

    if (user.role !== 'owner') {
      res.status(403).json({
        status: 'error',
        message: 'Only owners can create bookings.',
      });
      return;
    }

    const { walker_id, dog_id, booking_date, duration_hours } = req.body ?? {};

    if (
      !Number.isInteger(walker_id) ||
      walker_id <= 0 ||
      !Number.isInteger(dog_id) ||
      dog_id <= 0 ||
      typeof booking_date !== 'string' ||
      Number.isNaN(Date.parse(booking_date)) ||
      typeof duration_hours !== 'number' ||
      !Number.isFinite(duration_hours) ||
      duration_hours <= 0 ||
      duration_hours > 24
    ) {
      res.status(400).json({
        status: 'error',
        message: 'Provide valid walker_id, dog_id, booking_date and duration_hours.',
      });
      return;
    }

    const bookingDate = new Date(booking_date);

    if (bookingDate.getTime() <= Date.now()) {
      res.status(400).json({
        status: 'error',
        message: 'Booking date must be in the future.',
      });
      return;
    }

    const booking = await createBooking({
      owner_id: user.userId,
      walker_id,
      dog_id,
      booking_date: bookingDate.toISOString(),
      duration_hours,
    });

    if (!booking) {
      res.status(404).json({
        status: 'error',
        message: 'Your dog or the available walker was not found.',
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};


const handleWalkerDecision = (
  status: 'confirmed' | 'cancelled',
  message: string,
) => async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = res.locals.user as AuthUser;

    if (user.role !== 'walker') {
      res.status(403).json({
        status: 'error',
        message: 'Only walkers can accept or reject bookings.',
      });
      return;
    }

    const bookingId = Number(req.params.id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID.',
      });
      return;
    }

    const booking = await updateBookingStatus(
      bookingId,
      user.userId,
      status,
    );

    if (!booking) {
      res.status(404).json({
        status: 'error',
        message:
          'Booking not found, not assigned to you, or no longer pending.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptBooking = handleWalkerDecision(
  'confirmed',
  'Booking accepted successfully.',
);

export const rejectBooking = handleWalkerDecision(
  'cancelled',
  'Booking rejected successfully.',
);
