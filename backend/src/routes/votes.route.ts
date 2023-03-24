import { Router } from 'express';
import { vote } from '../controllers/votes.controller';

const router = Router();

router.post('/vote', vote);

export default router;
