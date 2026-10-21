import { Router } from 'express';
import { getDogs, addDog } from '../controllers/dog.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRole('owner'), getDogs);
router.post('/', requireRole('owner'), addDog);

export default router;
