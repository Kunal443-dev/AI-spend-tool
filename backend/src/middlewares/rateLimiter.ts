import rateLimit from 'express-rate-limit';

export const auditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30, 
  message: {
    error: 'Too many audit requests from this IP. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false, 
});

export const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, 
  message: {
    error: 'Too many lead submissions from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
