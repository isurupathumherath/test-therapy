import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { RequestHandler } from 'express';

export function createRateLimiterMiddleware(): RequestHandler {
  const limiter = new RateLimiterMemory({
    points: 100,
    duration: 60,
    blockDuration: 60,
  });

  return async (req, res, next) => {
    try {
      const key = req.ip || 'global';
      await limiter.consume(key);
      next();
    } catch (err) {
      res.status(429).json({ error: 'Too many requests' });
    }
  };
}
