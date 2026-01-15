import { Router } from 'express';
import { getCurrentBrief, saveBrief } from '../controllers/briefs.controller';

const router = Router();

router.get('/', getCurrentBrief);
router.post('/', saveBrief);

export default router;
