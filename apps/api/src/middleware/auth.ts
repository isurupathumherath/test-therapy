import type { Request, RequestHandler } from 'express';
import { verifyIdToken } from '../config/firebase.js';

export interface AuthedRequest extends Request {
  userId?: string;
  privateMode?: boolean;
}

export function authMiddleware(): RequestHandler {
  return async (req, res, next) => {
    try {
      const authHeader = req.header('authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
      const privateHeader = req.header('x-private-mode');
      (req as any).privateMode = privateHeader === 'true';

      if (!token) return res.status(401).json({ error: 'Missing auth token' });
      const decoded = await verifyIdToken(token);
      (req as any).userId = decoded.uid;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}
