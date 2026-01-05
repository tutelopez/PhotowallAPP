import { Schema, model } from 'mongoose';

export enum UserRole {
  ORGANIZER = 'organizer',
  GUEST = 'guest'
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.ORGANIZER
    }
  },
  { timestamps: true }
);

export const UserModel = model('User', UserSchema);
