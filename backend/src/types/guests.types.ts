import { Document, Types } from 'mongoose';

export interface GuestDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  token: string;
  event: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
