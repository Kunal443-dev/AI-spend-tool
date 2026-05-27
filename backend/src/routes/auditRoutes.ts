import { Router } from 'express';
import { createAudit, getAuditBySlug } from '../controllers/auditController';
import { auditLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/', auditLimiter, createAudit);
router.get('/:slug', getAuditBySlug);

export default router;
