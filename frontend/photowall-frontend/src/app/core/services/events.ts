import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateEventDto } from '@shared/dto/event/create-event.dto';
import { PhotoWallEvent } from '../../shared/models/Event.model';
import { map } from 'rxjs/operators';


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
  return this.http
    .get<any>(`${this.base}/${id}/manage`)
    .pipe(
      map(res => ({
        _id: res.event.id,
        name: res.event.name,
        slug: res.event.slug,
        date: res.event.date,
        type: res.event.type,
        qrCode: res.event.qrCode,
        isActive: true,
        coverImage: res.event.coverImage,
        profileImage: res.event.profileImage,
        organizer: res.event.organizer,
        photoCount: res.photos?.length ?? 0,
        createdAt: '',
        updatedAt: '',
        plan: res.event.plan,
        usage: res.usage,
        branding: res.event.branding ?? { accentColor: '#7C3AED' },
        messagesEnabled: res.event.messagesEnabled ?? true,
      }))
    );
}
 getMyEvents() {
  return this.http.get<PhotoWallEvent[]>(
    `${this.base}/my-events`
  );
}

toggleMessages(eventId: string, enabled: boolean) {
  return this.http.patch<{ message: string; event: PhotoWallEvent }>(
    `${this.base}/${eventId}/messages-toggle`,
    { enabled }
  );
}

updateBranding(eventId: string, accentColor: string) {
  return this.http.patch<{ message: string; event: PhotoWallEvent }>(
    `${this.base}/${eventId}/branding`,
    { accentColor }
  );
}

regenerateQR(eventId: string) {
  return this.http.patch<{ message: string; event: PhotoWallEvent }>(
    `${this.base}/${eventId}/regenerate-qr`,
    {}
  );
}

}
