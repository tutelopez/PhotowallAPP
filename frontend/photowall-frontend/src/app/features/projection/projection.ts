import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhotosService } from '../../core/services/photos';
import { EventsService } from '../../core/services/events';
import { Photo, PwEvent } from '../../shared/models';

@Component({
  selector: 'app-projection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="projection-view">
      <!-- Header bar -->
      <div class="proj-header">
        <div class="proj-logo"><span style="color:#F472B6">●</span> PhotoWall</div>
        @if (event()) {
          <div class="proj-event-name">{{ event()!.name }}</div>
        }
        <div class="badge-live">
          <span class="dot"></span> En vivo · {{ photos().length }} fotos
        </div>
      </div>

      <!-- Photo wall grid -->
      <div class="proj-grid" [class.has-featured]="featuredPhoto()">
        @if (featuredPhoto()) {
          <div class="proj-featured">
            <img [src]="featuredPhoto()!.url" [alt]="'Foto de ' + featuredPhoto()!.guestName">
            <div class="proj-photo-meta">📸 {{ featuredPhoto()!.guestName }}</div>
          </div>
        }
        @for (photo of otherPhotos(); track photo._id) {
          <div class="proj-thumb" (click)="setFeatured(photo)">
            <img [src]="photo.url" [alt]="photo.guestName">
            <div class="thumb-author">{{ photo.guestName }}</div>
          </div>
        }
      </div>

      @if (photos().length === 0) {
        <div class="proj-empty">
          <div class="proj-empty-icon">📸</div>
          <h2>Esperando fotos...</h2>
          <p>Los invitados pueden escanear el QR del evento para empezar a subir fotos</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .projection-view {
      min-height: 100vh;
      background: #080810;
      color: #F8F7FF;
      display: flex; flex-direction: column;
    }
    .proj-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 2rem;
      background: rgba(0,0,0,0.5);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      backdrop-filter: blur(12px);
    }
    .proj-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem; }
    .proj-event-name { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; }

    .proj-grid {
      flex: 1; padding: 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem; align-content: start;

      &.has-featured {
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto;
      }
    }
    .proj-featured {
      grid-column: 1 / 3;
      grid-row: 1 / 3;
      border-radius: 16px; overflow: hidden;
      position: relative; cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .proj-photo-meta {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 1rem 1.25rem;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      font-size: 1rem; font-weight: 500;
    }
    .proj-thumb {
      border-radius: 12px; overflow: hidden; position: relative;
      cursor: pointer; aspect-ratio: 1;
      img { width: 100%; height: 100%; object-fit: cover; }
      &:hover .thumb-author { opacity: 1; }
    }
    .thumb-author {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 0.5rem; font-size: 0.75rem;
      background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
      opacity: 0; transition: opacity 0.2s;
    }

    .proj-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center; gap: 1rem;
      .proj-empty-icon { font-size: 4rem; }
      h2 { font-family: 'Syne', sans-serif; font-size: 2rem; margin: 0; }
      p { color: rgba(248,247,255,0.5); max-width: 400px; margin: 0; line-height: 1.65; }
    }
  `]
})
export class ProjectionComponent implements OnInit, OnDestroy {
  private route         = inject(ActivatedRoute);
  private photosService = inject(PhotosService);
  private eventsService = inject(EventsService);

  event         = signal<PwEvent | null>(null);
  photos        = signal<Photo[]>([]);
  featuredPhoto = signal<Photo | null>(null);

  get otherPhotos() {
    return () => this.photos().filter(p => p._id !== this.featuredPhoto()?._id);
  }

  private pollInterval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';

    this.eventsService.getEventBySlug(slug).subscribe(ev => this.event.set(ev));
    this.loadPhotos(slug);

    this.pollInterval = setInterval(() => this.loadPhotos(slug), 4000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  setFeatured(photo: Photo) {
    this.featuredPhoto.set(photo);
  }

  private loadPhotos(slug: string) {
    this.photosService.getPhotosByEvent(slug).subscribe(photos => {
      this.photos.set(photos);
      if (!this.featuredPhoto() && photos.length > 0) {
        this.featuredPhoto.set(photos[0]);
      }
    });
  }
}
