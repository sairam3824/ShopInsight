import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Get identifier (IP or user ID)
  const identifier = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  // Get or create rate limit entry
  let entry = store[key];

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
    store[key] = entry;
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
        retryable: true,
      },
      retryAfter,
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
  res.setHeader('X-RateLimit-Remaining', (MAX_REQUESTS - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

  next();
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, WINDOW_MS);
