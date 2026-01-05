import { GuestDocument } from '../modules/guests/guest.types';

declare global {
  namespace Express {
    interface Request {
      guest?: GuestDocument;
    }
  }
}
declare global {
  namespace Express {
    interface Request {
      guest?: GuestDocument;
      file?: Multer.File;
      files?: Multer.File[];
      superAdmin?: UserDocument;
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
      };
    };
    
  }
}

export {};
