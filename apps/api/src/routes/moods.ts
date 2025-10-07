import { Router } from 'express';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';
import { MoodModel } from '../models/Mood.js';

export function moodsRouter() {
  const r = Router();

  r.get('/moods', authMiddleware(), async (req: AuthedRequest, res, next) => {
    try {
      const moods = await MoodModel.find({ userUid: (req as any).userId }).sort({ createdAt: -1 }).limit(30);
      res.json({ moods });
    } catch (err) { next(err); }
  });

  r.post('/moods', authMiddleware(), async (req: AuthedRequest, res, next) => {
    try {
      const { mood, note } = req.body as { mood?: string; note?: string };
      if (!mood) return res.status(400).json({ error: 'mood required' });
      if ((req as any).privateMode) return res.status(200).json({ mood: { mood, note, createdAt: new Date().toISOString() } });
      const created = await MoodModel.create({ userUid: (req as any).userId!, mood, note });
      res.status(201).json({ mood: created });
    } catch (err) { next(err); }
  });

  return r;
}
