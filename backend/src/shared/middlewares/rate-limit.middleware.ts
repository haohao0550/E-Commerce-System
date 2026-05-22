import rateLimit from 'express-rate-limit'
import type { Request } from 'express'

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,

  skip: (req: Request) => req.method === 'OPTIONS',

  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: {
      code: 'TOO_MANY_REQUESTS'
    }
  }
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS'
    }
  }
})