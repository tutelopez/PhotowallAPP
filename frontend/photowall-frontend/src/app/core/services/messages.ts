import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GuestMessage } from '../../shared/models/Message.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/messages`;
  sendMessage(eventId: string, guestId: string, text: string) {
    return this.http.post<{ message: string; data: GuestMessage }>(this.base, {
      eventId,
      guestId,
      text
    });
  }
  getMessagesByEvent(eventId: string) {
  return this.http
    .get<{ total: number; messages: GuestMessage[] }>(`${this.base}/event/${eventId}`)
    .pipe(map(res => res.messages));
}
deleteMessage(messageId: string) {
  return this.http.delete<void>(`${this.base}/${messageId}`);
}
}
