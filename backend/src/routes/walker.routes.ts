import { Router } from 'express';
import {
  getWalkers,
  getWalkerDetails,
} from '../controllers/walker.controller.js';

const router = Router();

router.get('/', getWalkers);
router.get('/:id', getWalkerDetails);

export default router;

