import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  score: number;
  quizzesAttempted: number;
  subscriptionStatus: 'active' | 'inactive' | 'pending';
  subscriptionExpiry: Date | null;
  role: 'admin' | 'user';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  score: { type: Number, default: 0 },
  quizzesAttempted: { type: Number, default: 0 },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'pending'], 
    default: 'inactive' 
  },
  subscriptionExpiry: { type: Date, default: null },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

// Force re-registration in development to pick up schema changes
if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
  delete (mongoose.models as any).User;
}

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

