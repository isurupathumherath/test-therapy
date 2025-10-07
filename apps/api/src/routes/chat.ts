import { Router } from 'express';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';
import { analyzeEmotionText } from '../services/huggingface.js';
import { generateTherapistReply, isCrisisText } from '../services/openai.js';
import { encryptJson } from '../security/encryption.js';
import { SessionModel } from '../models/Session.js';
import { getEnv } from '../config/env.js';

export function chatRouter() {
  const r = Router();

  r.post('/chat', authMiddleware(), async (req: AuthedRequest, res, next) => {
    try {
      const { message } = req.body as { message?: string };
      if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message required' });

      const emotion = await analyzeEmotionText(message).catch(() => 'neutral');
      const crisis = isCrisisText(message);
      const reply = await generateTherapistReply({ emotion, message }).catch(() => 'I hear you. Your feelings matter. Let’s take a gentle breath together and focus on one small, kind step you can take today.' );

      if (!(req as any).privateMode) {
        const env = getEnv();
        const messages = [
          { role: 'user', content: message },
          { role: 'assistant', content: reply }
        ];
        const encrypted = encryptJson(messages, env.ENCRYPTION_KEY);
        await SessionModel.create({ userUid: (req as any).userId!, messages: encrypted, emotionDetected: emotion });
      }

      res.json({ reply, emotion, crisis });
    } catch (err) {
      next(err);
    }
  });

  return r;
}
