import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PhotoWallEvent,
  CreateEventDto } from '../../shared/models/Event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/events`;

  getMyEvents() {
    return this.http.get<Event[]>(`${this.base}/mine`);
  }

  getEventById(id: string) {
    return this.http.get<Event>(`${this.base}/${id}`);
  }

  getEventBySlug(slug: string) {
    return this.http.get<Event>(`${this.base}/slug/${slug}`);
  }

  createEvent(payload: CreateEventDto) {
    return this.http.post<Event>(this.base, payload);
  }

  updateEvent(id: string, payload: Partial<CreateEventDto>) {
    return this.http.patch<Event>(`${this.base}/${id}`, payload);
  }

  deleteEvent(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleActive(id: string, isActive: boolean) {
    return this.http.patch<Event>(`${this.base}/${id}/status`, { isActive });
  }
}
