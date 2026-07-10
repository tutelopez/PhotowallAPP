import { PhotoWallEventType } from '../../enums/event-type.enum';



export interface CreateEventDto {
  name: string;
  date: string;
  type: PhotoWallEventType;
  description?: string;

  coverImage?: File;
  profileImage?: File;
}
