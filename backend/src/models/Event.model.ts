import { Schema, model } from 'mongoose';



export enum EventType {
  BODA = 'boda',
  CUMPLEANOS = 'cumpleaños',
  ANIVERSARIO = 'aniversario',
  EMPRESARIAL = 'evento_empresarial',
  BABYSHOWER = 'babyshower',
  BAUTIZO = 'bautizo',
  OTRO = 'otro'
}

const EventSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: Object.values(EventType) },

    slug: {
      type: String,
      unique: true,
      required: true
    },

    qrCode: {
      type: String,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },
    messagesEnabled: {
  type: Boolean,
  default: true
},

    coverImage: {
      type: String,
      default: ''
    },

    profileImage: {
      type: String,
      default: ''
    },

     organizer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
}

  },
  { timestamps: true }
);
export const EventModel = model('Event', EventSchema);
