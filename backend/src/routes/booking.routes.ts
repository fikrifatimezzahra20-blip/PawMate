import { Router } from 'express';
import {
  getBookings,
  addBooking,
} from '../controllers/booking.controller.js';

const router = Router();

router.get('/', getBookings);
router.post('/', addBooking);

export default router;
