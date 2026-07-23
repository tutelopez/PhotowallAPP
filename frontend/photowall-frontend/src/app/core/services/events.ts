import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateEventDto } from '@shared/dto/event/create-event.dto';
import { PhotoWallEvent } from '../../shared/models/Event.model';
import { map } from 'rxjs/operators';
import { PlanType } from '../../shared/models/Plan.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/events`;


  createEvent(dto: CreateEventDto & { desiredPlan?: PlanType }) {
  const formData = new FormData();
  formData.append('name', dto.name);
  formData.append('date', dto.date);
  formData.append('type', dto.type);
  if (dto.desiredPlan) {
    formData.append('desiredPlan', dto.desiredPlan);
  }
  if (dto.coverImage) formData.append('coverImage', dto.coverImage);
  if (dto.profileImage) formData.append('profileImage', dto.profileImage);
  return this.http.post<{ message: string; event: PhotoWallEvent }>(this.base, formData);
}

updateEvent(eventId: string, data: { name?: string; coverImage?: File; profileImage?: File }) {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.coverImage) formData.append('coverImage', data.coverImage);
  if (data.profileImage) formData.append('profileImage', data.profileImage);
  return this.http.put<{ message: string; event: PhotoWallEvent }>(`${this.base}/${eventId}`, formData);
}
requestPlanUpgrade(eventId: string, desiredPlan: PlanType) {
  return this.http.patch<{ message: string; event: PhotoWallEvent }>(
    `${this.base}/${eventId}/request-plan-upgrade`,
    { desiredPlan }
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
        pendingPlan: res.event.pendingPlan ?? null,
        desiredPlan: res.event.desiredPlan ?? null,
        usage: res.usage,
        branding: res.event.branding ?? { accentColor: '#7C3AED' },
        messagesEnabled: res.event.messagesEnabled ?? true,
        guests: res.guests?.list ?? [],
        guestCount: res.guests?.total ?? (res.guests?.list?.length ?? 0),
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

cancelPendingPlan(eventId: string) {
  return this.http.patch<{ message: string; event: PhotoWallEvent }>(
    `${this.base}/${eventId}/cancel-pending-plan`,
    {}
  );
}

disableGuest(eventId: string, guestId: string) {
  return this.http.patch<{ message: string; guest: any }>(
    `${this.base}/${eventId}/guests/${guestId}/disable`,
    {}
  );
}

}
