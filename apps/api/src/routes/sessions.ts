import { Router } from 'express';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';
import { SessionModel, type EncryptedPayload } from '../models/Session.js';
import { decryptJson } from '../security/encryption.js';
import { getEnv } from '../config/env.js';

export function sessionsRouter() {
  const r = Router();

  r.get('/sessions', authMiddleware(), async (req: AuthedRequest, res, next) => {
    try {
      const env = getEnv();
      const docs = await SessionModel.find({ userUid: (req as any).userId }).sort({ createdAt: -1 }).limit(50);
      const sessions = docs.map((doc) => ({
        id: doc._id.toString(),
        createdAt: doc.createdAt,
        emotionDetected: doc.emotionDetected,
        messages: (() => {
          try {
            return decryptJson<any[]>(doc.messages as EncryptedPayload, env.ENCRYPTION_KEY);
          } catch { return []; }
        })(),
      }));
      res.json({ sessions });
    } catch (err) { next(err); }
  });

  return r;
}
