import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface OrganizerAdmin {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  eventsCount?: number;
  premiumEventsCount?: number;
}

export interface EventAdmin {
  _id: string;
  name: string;
  slug: string;
  date: string;
  type: string;
  plan: 'free' | 'esencial' | 'estandar' | 'premium';
  organizer: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  } | string;
  createdAt?: string;
  stats?: {
    photos: number;
    messages: number;
    guests: number;
  };
}

export interface PaymentAdmin {
  _id: string;
  orderId: string;
  provider: string;
  providerOrderId: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  createdAt?: string;
  organizer?: { _id: string; name: string; email: string };
  event?: { _id: string; name: string; slug: string };
}

export interface SystemStatsAdmin {
  totalOrganizers: number;
  totalEvents: number;
  premiumEvents: number;
  totalPhotos: number;
  totalMessages: number;
  totalGuests: number;
  totalRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  // System Stats
  getSystemStats(): Observable<SystemStatsAdmin> {
    return this.http.get<SystemStatsAdmin>(`${this.base}/stats`);
  }

  // Payments
  getAllPayments(): Observable<{ total: number; totalRevenue: number; payments: PaymentAdmin[] }> {
    return this.http.get<{ total: number; totalRevenue: number; payments: PaymentAdmin[] }>(`${this.base}/payments`);
  }

  // Organizers
  getOrganizers(): Observable<{ total: number; organizers: OrganizerAdmin[] }> {
    return this.http.get<{ total: number; organizers: OrganizerAdmin[] }>(`${this.base}/organizers`);
  }

  getEventsByOrganizer(organizerId: string): Observable<{ total: number; events: EventAdmin[] }> {
    return this.http.get<{ total: number; events: EventAdmin[] }>(`${this.base}/organizers/${organizerId}/events`);
  }

  deleteOrganizer(organizerId: string): Observable<any> {
    return this.http.delete(`${this.base}/organizers/${organizerId}`);
  }

  // Events
  getAllEvents(): Observable<{ total: number; events: EventAdmin[] }> {
    return this.http.get<{ total: number; events: EventAdmin[] }>(`${this.base}/events`);
  }

  deleteEventById(eventId: string): Observable<any> {
    return this.http.delete(`${this.base}/events/${eventId}`);
  }

  deleteEventsByOrganizer(organizerId: string): Observable<any> {
    return this.http.delete(`${this.base}/organizers/${organizerId}/events`);
  }

  setEventPlan(eventId: string, plan: string): Observable<any> {
    return this.http.patch(`${this.base}/events/${eventId}/plan`, { plan });
  }

  // System Utilities
  deleteAllEvents(): Observable<any> {
    return this.http.delete(`${this.base}/events`);
  }

  resetAllData(): Observable<any> {
    const headers = new HttpHeaders().set('x-confirm', 'YES_RESET_ALL');
    return this.http.delete(`${this.base}/reset-all`, { headers });
  }

  seedDatabase(): Observable<any> {
    return this.http.post(`${this.base}/seed`, {});
  }
}
