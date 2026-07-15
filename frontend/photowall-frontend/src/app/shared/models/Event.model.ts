import { PhotoWallEventType } from "../enums/event-type.enum";
import { PlanType, PlanUsage } from './Plan.model';

export interface PhotoWallEvent {
  _id: string;
  name: string;
  slug: string;
  date: string;
  type: PhotoWallEventType;
  qrCode: string;
  isActive: boolean;
  coverImage: string;
  profileImage: string;
  organizer: string;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
  messagesEnabled: boolean;
  plan: PlanType;
  branding?: { accentColor: string };
usage?: PlanUsage;
}
