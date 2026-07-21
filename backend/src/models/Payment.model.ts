import { Schema, model, Types } from 'mongoose';
import { PlanType } from './Plan';
const PaymentSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    event: { type: Types.ObjectId, ref: 'Event', required: true },
    organizer: { type: Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: Object.values(PlanType), required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    boldTransactionId: { type: String, default: null }
  },
  { timestamps: true }
);
export const PaymentModel = model('Payment', PaymentSchema);