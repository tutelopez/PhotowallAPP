import { PhotoWallEventType } from '../../enums/event-type.enum';
export interface CreateEventDto {
  name: string;
  date: string;
  type: PhotoWallEventType;
  coverImage?: File;
  profileImage?: File;
}
