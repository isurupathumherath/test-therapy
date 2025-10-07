export async function textToSpeech(_text: string, _voice: 'calm' | 'friendly' | 'professional' = 'calm'): Promise<Buffer> {
  // Placeholder: implement OpenAI TTS or ElevenLabs in future.
  throw Object.assign(new Error('TTS not implemented'), { status: 501 });
}
