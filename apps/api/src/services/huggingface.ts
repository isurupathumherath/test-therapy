import { getEnv } from '../config/env.js';
import { fetch } from 'undici';

export async function analyzeEmotionText(text: string): Promise<string> {
  const env = getEnv();
  if (!env.HUGGINGFACE_API_KEY) return 'neutral';

  const resp = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: text })
  });

  if (!resp.ok) return 'neutral';
  const data = await resp.json();
  const first = Array.isArray(data) ? data[0] : null;
  const best = Array.isArray(first) ? first.reduce((a: any, b: any) => (a.score > b.score ? a : b), first[0]) : null;
  return best?.label?.toLowerCase?.() ?? 'neutral';
}
