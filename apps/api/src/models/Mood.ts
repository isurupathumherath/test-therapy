import { Schema, model, type Types } from 'mongoose';

export interface Mood {
  _id: Types.ObjectId;
  userUid: string; // Firebase UID
  mood: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MoodSchema = new Schema<Mood>({
  userUid: { type: String, required: true, index: true },
  mood: { type: String, required: true },
  note: { type: String },
}, { timestamps: true });

export const MoodModel = model<Mood>('Mood', MoodSchema);
