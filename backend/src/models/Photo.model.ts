import { Schema, model, Types } from 'mongoose';

const PhotoSchema = new Schema(
  {
    event: {
      type: Types.ObjectId,
      ref: 'Event',
      required: true
    },
    uploadedBy: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    duration: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

export const PhotoModel = model('Photo', PhotoSchema);
