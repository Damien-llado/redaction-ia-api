import { Router } from 'express';
import {
  getRedactions,
  createRedaction,
  updateRedaction
} from '../controllers/redactions.controller';

const router = Router();

router.get('/', getRedactions);
router.post('/', createRedaction);
router.put('/:id', updateRedaction);

export default router;
