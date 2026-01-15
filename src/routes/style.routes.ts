import { Router } from 'express';
import { saveStyleRequest, updateStyleResult } from '../controllers/style.controller';

const router = Router();

router.post('/', saveStyleRequest);
router.put('/:project_id', updateStyleResult);

export default router;
