import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';

export interface NewPhotoEvent {
  _id: string;
  uploadedBy: string;
  imageUrl: string;
  createdAt: string;
}

export interface NewMessageEvent {
  _id: string;
  authorName: string;
  text: string;
  createdAt: string;
}
export interface MessagesToggleEvent {
  enabled: boolean;
}



@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  private connect(): Socket {
    if (!this.socket) {
      const base = environment.socketUrl || window.location.origin;
      this.socket = io(base, {
        transports: ['websocket', 'polling']
      });
    }
    return this.socket;
  }

  joinEvent(eventId: string) {
    this.connect().emit('join-event', eventId);
  }

  onNewPhoto(callback: (photo: NewPhotoEvent) => void) {
    this.connect().on('new-photo', callback);
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    const socket = this.connect();
    socket.on('connect', () => callback(true));
    socket.on('disconnect', () => callback(false));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }


onNewMessage(callback: (msg: NewMessageEvent) => void) {
  this.connect().on('new-message', callback);
}
onMessagesToggle(callback: (payload: MessagesToggleEvent) => void) {
  this.connect().on('messages-toggle', callback);
}

onMessageDeleted(callback: (payload: { _id: string }) => void) {
  this.connect().on('message-deleted', callback);
}

}
