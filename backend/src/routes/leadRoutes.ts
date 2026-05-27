import { Router } from 'express';
import { createLead } from '../controllers/leadController';
import { leadLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/', leadLimiter, createLead);

export default router;
