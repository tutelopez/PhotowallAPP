import { Schema, model } from 'mongoose';
import { PlanType } from './Plan';



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
plan: {
  type: String,
  enum: Object.values(PlanType),
  default: PlanType.FREE
},
branding: {
  accentColor: {
    type: String,
    default: '#7C3AED'
  }
},

    coverImage: {
      type: String,
      default: ''
    },
archivedAt: {
  type: Date,
  default: null
},
    profileImage: {
      type: String,
      default: ''
    },

     organizer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
},
pendingPlan: {
  type: String,
  enum: [...Object.values(PlanType), null],
  default: null
},
desiredPlan: {
  type: String,
  enum: [...Object.values(PlanType), null],
  default: null
},
reminderSentAt: {
  type: Date,
  default: null
},

  },
  
  { timestamps: true }
);
export const EventModel = model('Event', EventSchema);
