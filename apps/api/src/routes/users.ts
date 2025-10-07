import { Router } from 'express';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';
import { UserModel } from '../models/User.js';
import { MoodModel } from '../models/Mood.js';
import { SessionModel } from '../models/Session.js';

export function usersRouter() {
  const r = Router();

  r.get('/users/me', authMiddleware(), async (req: AuthedRequest, res, next) => {
    try {
      const user = await UserModel.findOneAndUpdate(
        { uid: (req as any).userId },
        { $setOnInsert: { plan: 'free' } },
        { upsert: true, new: true }
      );
      res.json({ user });
    } catch (err) { next(err); }
  });

  r.delete('/users/me', authMiddleware(), async (req: AuthedRequest, res, next) => {
    try {
      const uid = (req as any).userId!;
      await Promise.all([
        MoodModel.deleteMany({ userUid: uid }),
        SessionModel.deleteMany({ userUid: uid }),
        UserModel.deleteOne({ uid })
      ]);
      res.status(204).end();
    } catch (err) { next(err); }
  });

  return r;
}
