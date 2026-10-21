import { Router } from 'express';
import { getBookings, addBooking } from '../controllers/booking.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', getBookings);
router.post('/', addBooking);

export default router;
