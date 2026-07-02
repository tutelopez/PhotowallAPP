import { PhotoWallEvent } from './../../shared/models/Event.model';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Guest } from '../../shared/models/Guest.model';
import { GuestSession } from '../../shared/models/guest-session.model';
import { JoinEventDto } from '../../shared/dto/guest/join-event.dto';


const GUEST_SESSION_KEY = 'pw_guest_sessions'; // map of slug → GuestSession

@Injectable({ providedIn: 'root' })
export class GuestService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/guests`;

  private _sessions = signal<Record<string, GuestSession>>(this.loadSessions());



join(
  eventId: string,
  eventSlug: string,
  payload: JoinEventDto
) {
  return this.http
    .post<{ guestId: string; name: string; token: string }>(
      `${this.base}/join/${eventId}`,
      payload
    )
    .pipe(
      tap((response) => {

        const session: GuestSession = {
          guestId: response.guestId,
          guestName: response.name,
          eventId,
          token: response.token
        };

        const sessions = {
          ...this._sessions(),
          [eventSlug]: session
        };

        this._sessions.set(sessions);

        localStorage.setItem(
          GUEST_SESSION_KEY,
          JSON.stringify(sessions)
        );

      })
    );
}


  private loadSessions(): Record<string, GuestSession> {
    try {
      const raw = localStorage.getItem(GUEST_SESSION_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }



getSession(eventId: string): GuestSession | null {
  return this._sessions()[eventId] ?? null;
}

hasSession(eventId: string): boolean {
  return !!this.getSession(eventId);
}

getTokenForEvent(eventId: string): string | null {
  return this._sessions()[eventId]?.token ?? null;
}

getGuestId(eventId: string): string | null {
  return this._sessions()[eventId]?.guestId ?? null;
}

getGuestName(eventId: string): string | null {
  return this._sessions()[eventId]?.guestName ?? null;
}

clearSession(eventId: string) {
  const sessions = { ...this._sessions() };

  delete sessions[eventId];

  this._sessions.set(sessions);

  localStorage.setItem(
    GUEST_SESSION_KEY,
    JSON.stringify(sessions)
  );
}

}
