"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditController_1 = require("../controllers/auditController");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.post('/', rateLimiter_1.auditLimiter, auditController_1.createAudit);
router.get('/:slug', auditController_1.getAuditBySlug);
exports.default = router;
