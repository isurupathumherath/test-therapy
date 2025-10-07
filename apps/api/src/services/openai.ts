import OpenAI from 'openai';
import fs from 'node:fs/promises';
import { getEnv } from '../config/env.js';

const CRISIS_PHRASES = [
  'i want to end my life',
  'suicide',
  'kill myself',
  "can't go on",
  'no reason to live',
  'end it all'
];

export function isCrisisText(text: string): boolean {
  const normalized = text.toLowerCase();
  return CRISIS_PHRASES.some((p) => normalized.includes(p));
}

async function loadTherapistPrompt(): Promise<string> {
  const fallback = 'You are a licensed therapist and empathy coach named MindMate. Be calm, kind, supportive. Validate emotions first, then suggest one practical next step.';
  try {
    const url = new URL('../prompts/therapist.txt', import.meta.url);
    return await fs.readFile(url, 'utf8');
  } catch {
    return fallback;
  }
}

export async function generateTherapistReply(params: { emotion: string; message: string }): Promise<string> {
  const env = getEnv();
  const persona = await loadTherapistPrompt();
  const content = `${persona}\n\nCurrent user emotion: ${params.emotion}\nUser message: ${params.message}\nRespond in 2–4 sentences.`;

  if (!env.OPENAI_API_KEY) {
    return 'I hear how heavy this feels right now. Your feelings are valid, and it makes sense you’re overwhelmed. Let’s take one small step: try a slow inhale for 4 seconds, hold for 2, exhale for 6, and notice how your body softens.';
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: persona },
      { role: 'user', content }
    ],
    temperature: 0.7,
  });
  const text = resp.choices[0]?.message?.content ?? '';
  return text.trim();
}
