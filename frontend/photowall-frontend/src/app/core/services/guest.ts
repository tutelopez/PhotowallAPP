import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Guest, GuestSession, JoinEventPayload } from '@shared/models';

const GUEST_SESSION_KEY = 'pw_guest_sessions'; // map of slug → GuestSession

@Injectable({ providedIn: 'root' })
export class GuestService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/guests`;

  private _sessions = signal<Record<string, GuestSession>>(this.loadSessions());

  getSession(slug: string): GuestSession | null {
    return this._sessions()[slug] ?? null;
  }

  hasSession(slug: string): boolean {
    return !!this.getSession(slug);
  }

  join(slug: string, payload: JoinEventPayload) {
    return this.http
      .post<{ guest: Guest; token: string }>(`${this.base}/join/${slug}`, payload)
      .pipe(
        tap(res => {
          const session: GuestSession = {
            token: res.token,
            guestName: res.guest.name,
            eventSlug: slug
          };
          const updated = { ...this._sessions(), [slug]: session };
          this._sessions.set(updated);
          localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));
        })
      );
  }

  getTokenForSlug(slug: string): string | null {
    return this._sessions()[slug]?.token ?? null;
  }

  private loadSessions(): Record<string, GuestSession> {
    try {
      const raw = localStorage.getItem(GUEST_SESSION_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}
