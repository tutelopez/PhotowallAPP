import { Schema, model, Types } from 'mongoose';
const MessageSchema = new Schema(
  {
    event: {
      type: Types.ObjectId,
      ref: 'Event',
      required: true
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    }
  },
  { timestamps: true }
);
export const MessageModel = model('Message', MessageSchema);