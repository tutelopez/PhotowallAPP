import { EventType } from '../enums/event-type.enum';

export interface PhotoWallEvent {
  _id: string;

  name: string;

  date: string;

  type: EventType;

  slug: string;

  qrCode: string;

  isActive: boolean;

  coverImage: string;

  profileImage: string;

  organizer: string;

  createdAt: string;

  updatedAt: string;

  photoCount?: number; // ← opcional

}

/**
 * DTO para crear un evento.
 * Equivale al body del POST /events
 */
export interface CreateEventDto {
  name: string;
  date: string;
  type: EventType;

  coverImage?: File;
  profileImage?: File;
}

/**
 * DTO para actualizar un evento.
 * Equivale al body del PUT /events/:eventId
 */
export interface UpdateEventDto {
  name?: string;
  date?: string;
  type?: EventType;

  coverImage?: File;
  profileImage?: File;

  isActive?: boolean;
}
