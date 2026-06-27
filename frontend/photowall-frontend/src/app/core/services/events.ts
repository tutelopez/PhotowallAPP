import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateEventPayload, PwEvent } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/events`;

  getMyEvents() {
    return this.http.get<PwEvent[]>(`${this.base}/mine`);
  }

  getEventById(id: string) {
    return this.http.get<PwEvent>(`${this.base}/${id}`);
  }

  getEventBySlug(slug: string) {
    return this.http.get<PwEvent>(`${this.base}/slug/${slug}`);
  }

  createEvent(payload: CreateEventPayload) {
    return this.http.post<PwEvent>(this.base, payload);
  }

  updateEvent(id: string, payload: Partial<CreateEventPayload>) {
    return this.http.patch<PwEvent>(`${this.base}/${id}`, payload);
  }

  deleteEvent(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleActive(id: string, isActive: boolean) {
    return this.http.patch<PwEvent>(`${this.base}/${id}/status`, { isActive });
  }
}
