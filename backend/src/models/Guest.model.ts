import { Schema, model, Types } from 'mongoose';
import { randomUUID } from 'crypto';

const GuestSchema = new Schema(
  {
    event: {
      type: Types.ObjectId,
      ref: 'Event',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    token: {
      type: String,
      unique: true,
      default: () => randomUUID()
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const GuestModel = model('Guest', GuestSchema);
