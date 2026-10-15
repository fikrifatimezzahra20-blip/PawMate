import { Router } from 'express';
import { getWalkers } from '../controllers/walker.controller.js';

const router = Router();

router.get('/', getWalkers);

export default router;
