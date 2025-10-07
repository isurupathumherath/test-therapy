import { Schema, model, type Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  uid: string; // Firebase UID
  email: string;
  name?: string;
  plan: 'free' | 'premium';
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<User>({
  uid: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  name: { type: String },
  plan: { type: String, enum: ['free', 'premium'], default: 'free', index: true },
  stripeCustomerId: { type: String },
}, { timestamps: true });

export const UserModel = model<User>('User', UserSchema);
