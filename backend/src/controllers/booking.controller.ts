import type { Request, Response, NextFunction } from 'express';
import {
  getAllBookings,
  createBooking,
} from '../models/booking.model.js';

export const getBookings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await getAllBookings();

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
    const { walker_id, dog_id, booking_date, duration_hours } = req.body;

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
      walker_id,
      dog_id,
      booking_date: bookingDate.toISOString(),
      duration_hours,
    });

    if (!booking) {
      res.status(404).json({
        status: 'error',
        message: 'Available walker or dog not found.',
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
