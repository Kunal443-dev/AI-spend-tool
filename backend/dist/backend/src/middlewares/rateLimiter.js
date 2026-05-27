"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadLimiter = exports.auditLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.auditLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        error: 'Too many audit requests from this IP. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.leadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        error: 'Too many lead submissions from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
