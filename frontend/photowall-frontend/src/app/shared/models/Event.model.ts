import { PhotoWallEventType } from "../enums/event-type.enum";

export interface PhotoWallEvent {

  _id: string;

  name: string;

  description?: string;

  slug: string;

  date: string;

  type: PhotoWallEventType;

  qrCode: string;

  isActive: boolean;

  photoCount: number;

  createdAt: string;

  updatedAt: string;

}

export interface CreateEventDto {

  name: string;

  description?: string;

  date: string;

  type: PhotoWallEventType;

}
