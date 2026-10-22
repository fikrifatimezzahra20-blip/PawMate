
import { Router } from 'express';

import {
  getBookings,
  addBooking,
  acceptBooking,
  rejectBooking,
} from '../controllers/booking.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getBookings);
router.post('/', addBooking);

router.patch('/:id/accept', acceptBooking);
router.patch('/:id/reject', rejectBooking);

export default router;
