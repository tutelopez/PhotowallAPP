// ─── User / Auth ─────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// ─── Event ───────────────────────────────────────────────────────────────────

export type EventType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'corporate'
  | 'graduation'
  | 'party'
  | 'other';

export interface PwEvent {
  _id: string;
  name: string;
  slug: string;
  date: string;
  type: EventType;
  description?: string;
  organizerId: string;
  qrUrl: string;
  photoCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEventPayload {
  name: string;
  date: string;
  type: EventType;
  description?: string;
}

// ─── Guest ───────────────────────────────────────────────────────────────────

export interface Guest {
  _id: string;
  name: string;
  eventId: string;
  guestToken: string;
  createdAt: string;
}

export interface JoinEventPayload {
  name: string;
}

export interface GuestSession {
  token: string;
  guestName: string;
  eventSlug: string;
}

// ─── Photo ───────────────────────────────────────────────────────────────────

export interface Photo {
  _id: string;
  eventId: string;
  guestId: string;
  guestName: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
}

export interface UploadPhotoPayload {
  eventSlug: string;
  file: File;
  caption?: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
}
