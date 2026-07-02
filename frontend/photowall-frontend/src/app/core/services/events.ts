import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PhotoWallEvent, CreateEventDto } from '../../shared/models/Event.model';

import { EVENTS_MOCK } from '../mocks/event.mock';
import { LocalStorageService } from '../storage/local-storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private readonly storage = inject(LocalStorageService);

  private readonly eventsSignal = signal<PhotoWallEvent[]>([]);

  readonly events = computed(() => this.eventsSignal());

  constructor() {
    this.restoreEvents();
  }

  //-----------------------------------------

  getMyEvents(): Observable<PhotoWallEvent[]> {
    return of(this.events());
  }

  //-----------------------------------------

  getEventById(id: string): Observable<PhotoWallEvent> {

    const event = this.events().find(e => e._id === id)!;

    return of(event);

  }

  //-----------------------------------------

  getEventBySlug(slug: string): Observable<PhotoWallEvent> {

    const event = this.events().find(e => e.slug === slug)!;

    return of(event);

  }

  //-----------------------------------------

  createEvent(dto: CreateEventDto): Observable<PhotoWallEvent> {

    const slug =
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      +
      '-'
      +
      crypto.randomUUID().substring(0,6);

    const qrCode =
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/e/' + slug)}`;

    const event: PhotoWallEvent = {

      _id: crypto.randomUUID(),

      name: dto.name,

      description: dto.description,

      date: dto.date,

      type: dto.type,

      slug,

      qrCode,

      isActive: true,

      photoCount: 0,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString()

    };

    const updated = [...this.events(), event];

    this.eventsSignal.set(updated);

    this.storage.set(STORAGE_KEYS.EVENT, updated);

    return of(event);

  }

  //-----------------------------------------

  updateEvent(
    id: string,
    dto: Partial<CreateEventDto>
  ): Observable<PhotoWallEvent> {

    const updated = this.events().map(event => {

      if(event._id !== id) return event;

      return {

        ...event,

        ...dto,

        updatedAt: new Date().toISOString()

      };

    });

    this.eventsSignal.set(updated);

    this.storage.set(STORAGE_KEYS.EVENT, updated);

    return of(updated.find(e => e._id === id)!);

  }

  //-----------------------------------------

  deleteEvent(id: string): Observable<void> {

    const updated =
      this.events().filter(e => e._id !== id);

    this.eventsSignal.set(updated);

    this.storage.set(STORAGE_KEYS.EVENT, updated);

    return of(void 0);

  }

  //-----------------------------------------

  toggleActive(
    id: string,
    active: boolean
  ): Observable<PhotoWallEvent> {

    const updated = this.events().map(event => {

      if(event._id !== id) return event;

      return {

        ...event,

        isActive: active,

        updatedAt: new Date().toISOString()

      };

    });

    this.eventsSignal.set(updated);

    this.storage.set(STORAGE_KEYS.EVENT, updated);

    return of(updated.find(e => e._id === id)!);

  }

  //-----------------------------------------

  private restoreEvents(): void {

    const saved =
      this.storage.get<PhotoWallEvent[]>(STORAGE_KEYS.EVENT);

    if(saved){

      this.eventsSignal.set(saved);

    }else{

      this.eventsSignal.set(EVENTS_MOCK);

    }

  }

}
