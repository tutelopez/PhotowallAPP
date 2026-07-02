import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import {
  PhotoWallEvent,
  CreateEventDto
} from '../../shared/models/Event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private http = inject(HttpClient);

  private base = `${environment.apiUrl}/events`;

  createEvent(dto: CreateEventDto) {
    return this.http.post<{
      message: string;
      event: PhotoWallEvent;
    }>(
      this.base,
      dto
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

  getMyEvents(organizerId: string) {
    return this.http.get<PhotoWallEvent[]>(
      `${this.base}/organizer/${organizerId}`
    );
  }

}
