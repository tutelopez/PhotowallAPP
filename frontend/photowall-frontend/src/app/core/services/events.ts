import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateEventDto } from '@shared/dto/event/create-event.dto';
import { PhotoWallEvent } from '../../shared/models/Event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private http = inject(HttpClient);

  private base = `${environment.apiUrl}/events`;

  createEvent(dto: CreateEventDto) {

  const formData = new FormData();

  formData.append('name', dto.name);
  formData.append('date', dto.date);
  formData.append('type', dto.type);

  if (dto.description) {
    formData.append('description', dto.description);
  }

  if (dto.coverImage) {
    formData.append(
      'coverImage',
      dto.coverImage
    );
  }

  if (dto.profileImage) {
    formData.append(
      'profileImage',
      dto.profileImage
    );
  }

  return this.http.post<{
    message: string;
    event: PhotoWallEvent;
  }>(
    this.base,
    formData
  );

}

  getEventBySlug(slug: string) {
    return this.http.get<PhotoWallEvent>(
      `${this.base}/${slug}`
    );
  }

  getEventById(id: string) {
    return this.http.get<PhotoWallEvent>(
      `${this.base}/${id}/manage`
    );
  }

 getMyEvents() {
  return this.http.get<PhotoWallEvent[]>(
    `${this.base}/my-events`
  );
}

}
