import { Schema, model, type Types } from 'mongoose';

export type EncryptedPayload = {
  iv: string;
  authTag: string;
  ciphertext: string;
};

export interface Session {
  _id: Types.ObjectId;
  userUid: string; // Firebase UID
  messages: EncryptedPayload; // encrypted JSON array of chat messages
  emotionDetected?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<Session>({
  userUid: { type: String, required: true, index: true },
  messages: { iv: String, authTag: String, ciphertext: String },
  emotionDetected: { type: String },
}, { timestamps: true });

export const SessionModel = model<Session>('Session', SessionSchema);
