import { Router } from 'express';
import {
  getDogs,
  addDog,
} from '../controllers/dog.controller.js';

const router = Router();

router.get('/', getDogs);
router.post('/', addDog);

export default router;
