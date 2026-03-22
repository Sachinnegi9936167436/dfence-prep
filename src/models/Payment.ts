import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  plan: '1_week' | '1_month' | '3_months';
  amount: number;
  utrNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { 
    type: String, 
    enum: ['1_week', '1_month', '3_months'], 
    required: true 
  },
  amount: { type: Number, required: true },
  utrNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
});

export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
