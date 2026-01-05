import { Schema, model, Types } from 'mongoose';

const PhotoSchema = new Schema(
  {
    event: {
      type: Types.ObjectId,
      ref: 'Event',
      required: true
    },
    uploadedBy: {
      type: String, // nombre del invitado o organizer
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const PhotoModel = model('Photo', PhotoSchema);
