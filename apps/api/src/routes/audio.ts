import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export function audioRouter() {
  const r = Router();

  r.post('/audio/transcribe', authMiddleware(), upload.single('file'), async (_req, res) => {
    res.status(501).json({ error: 'Transcription not implemented yet' });
  });

  r.post('/audio/emotion', authMiddleware(), upload.single('file'), async (_req, res) => {
    res.status(200).json({ emotion: 'neutral' });
  });

  r.post('/audio/tts', authMiddleware(), async (_req, res) => {
    res.status(501).json({ error: 'TTS not implemented yet' });
  });

  return r;
}
