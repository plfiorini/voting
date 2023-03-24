import { Router } from 'express';
import { vote } from '../controllers/votes.controller';

const router = Router();

router.post('/votes', vote);

export default router;
