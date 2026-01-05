import { Schema, model } from 'mongoose';

export enum UserRole {
  ORGANIZER = 'organizer',
  GUEST = 'guest',
  SUPER_ADMIN = 'super_admin',
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
    },

    // 👇 SOLO PARA GUESTS
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    }
  },
  { timestamps: true }
);

export const UserModel = model('User', UserSchema);
