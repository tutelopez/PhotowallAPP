import { GuestDocument } from '../modules/guests/guest.types';

declare global {
  namespace Express {
    interface Request {
      guest?: GuestDocument;
    }
  }
}

export {};
