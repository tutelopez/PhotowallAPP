import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../core/services/guest';
import { PhotosService } from '../../core/services/photos';
import { EventsService } from '../../core/services/events';
import { PhotoWallEvent } from '../../shared/models/Event.model';
import { Photo } from '../../shared/models/Photo.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="gallery-page">
      <!-- Join modal -->
      @if (!hasSession() && !loading()) {
        <div class="join-overlay">
          <div class="join-card">
            <div class="join-logo"><span style="color:#F472B6">●</span> PhotoWall</div>
            <h2>¡Bienvenido al evento!</h2>
            @if (event()) {
              <p class="join-event-name">{{ event()!.name }}</p>
            }
            <p class="join-desc">Ingresa tu nombre para acceder y subir fotos al álbum compartido</p>
            <form [formGroup]="joinForm" (ngSubmit)="join()">
              <input type="text" formControlName="name"
                     placeholder="Tu nombre" class="join-input">
              <button type="submit" class="btn-pw-primary w-full"
                      [disabled]="joiningLoading() || joinForm.invalid">
                @if (joiningLoading()) { Entrando… } @else { Entrar al evento →}
              </button>
            </form>
          </div>
        </div>
      }

      <!-- Gallery view -->
      @if (hasSession()) {

        <!-- Hero: portada + foto de perfil + nombre + fecha -->
        @if (event()) {
          <div class="event-hero">
            <div class="hero-cover"
                 [style.backgroundImage]="'url(' + event()!.coverImage + ')'">
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
              @if (event()!.profileImage) {
                <div class="hero-avatar">
                  <img [src]="event()!.profileImage" [alt]="event()!.name">
                </div>
              }
              <h1 class="hero-title">{{ event()!.name }}</h1>
              <div class="hero-date">
                <i class="bi bi-calendar-event"></i>
                <span>{{ event()!.date | date:'dd MMMM yyyy' }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Barra de acción -->
        <div class="gallery-toolbar">
          <div class="gallery-toolbar__inner">
            <div class="badge-live">
              <span class="dot"></span> En vivo
            </div>
            <div class="upload-area">
              <input type="file" id="photo-upload" accept="image/*" multiple
                     (change)="onFileSelected($event)" hidden #fileInput>
              <button class="btn-pw-primary" (click)="fileInput.click()">
                <i class="bi bi-camera"></i> Subir foto
              </button>
            </div>
          </div>
        </div>

        <!-- Galería -->
        <div class="photo-grid">
          @for (photo of photos(); track photo._id) {
            <div class="grid-photo">
              <div class="photo-img-wrap">
                <img [src]="photo.imageUrl"
                     [alt]="'Foto de ' + photo.uploadedBy"
                     loading="lazy">
              </div>
              <div class="photo-caption">
                <i class="bi bi-person-circle"></i>
                <span>Subido por: <strong>{{ photo.uploadedBy }}</strong></span>
              </div>
            </div>
          }
          @if (photos().length === 0) {
            <div class="no-photos">
              <p>Sé el primero en subir una foto 📸</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .gallery-page { min-height: 100vh; background: var(--pw-ink); }

    .join-overlay {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      background: radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.15), transparent 60%);
    }
    .join-card {
      width: 100%; max-width: 420px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 20px; padding: 2.5rem; text-align: center;
    }
    .join-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem; margin-bottom: 1.5rem; }
    .join-event-name { color: #A78BFA; font-weight: 600; font-size: 1rem; margin: 0.25rem 0 1rem; }
    .join-desc { color: rgba(248,247,255,0.55); font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.6; }
    .join-input {
      width: 100%; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px; padding: 0.75rem 1rem;
      color: #F8F7FF; font-size: 0.95rem;
      outline: none; margin-bottom: 1rem;
      text-align: center;
      &::placeholder { color: rgba(248,247,255,0.3); }
      &:focus { border-color: rgba(124,58,237,0.6); }
    }
    .w-full { width: 100%; justify-content: center; }

    /* ---- Hero (portada + perfil + título + fecha) ---- */
    .event-hero { position: relative; margin-bottom: 0.5rem; }
    .hero-cover {
      height: 260px;
      background-size: cover;
      background-position: center;
      background-color: var(--pw-ink-soft);
      position: relative;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom,
        rgba(13,13,20,0.10) 0%,
        rgba(13,13,20,0.55) 60%,
        var(--pw-ink) 100%);
    }
    .hero-content {
      position: relative;
      margin-top: -72px;
      padding: 0 2rem 1.5rem;
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .hero-avatar {
      width: 116px; height: 116px; border-radius: 50%; overflow: hidden;
      border: 4px solid var(--pw-ink);
      box-shadow: 0 0 0 1px rgba(124,58,237,0.45), 0 10px 30px rgba(0,0,0,0.45);
      background: var(--pw-ink-soft);
      margin-bottom: 0.85rem;
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    }
    .hero-title { font-size: 1.9rem; margin: 0 0 0.4rem; }
    .hero-date {
      display: inline-flex; align-items: center; gap: 0.4rem;
      color: rgba(248,247,255,0.6); font-size: 0.9rem;
      i { color: var(--pw-rose); }
    }

    /* ---- Barra de acción ---- */
    .gallery-toolbar {
      padding: 1rem 2rem;
      background: rgba(13,13,20,0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      position: sticky; top: 0; z-index: 10;
    }
    .gallery-toolbar__inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    }

    /* ---- Grid de fotos ---- */
    .photo-grid {
      padding: 1.5rem 2rem;
      max-width: 1200px; margin: 0 auto;
      columns: 3 280px; gap: 1rem;
    }
    .grid-photo {
      break-inside: avoid; margin-bottom: 1rem;
      border-radius: 14px; overflow: hidden;
      background: var(--pw-card-bg);
      border: 1px solid var(--pw-card-border);
      transition: border-color 0.2s, transform 0.2s;
      &:hover { border-color: rgba(124,58,237,0.4); transform: translateY(-3px); }
    }
    .photo-img-wrap img { width: 100%; display: block; }
    .photo-caption {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.65rem 0.9rem;
      font-size: 0.78rem;
      color: rgba(248,247,255,0.65);
      i { color: var(--pw-violet-light); font-size: 0.95rem; }
      strong { color: var(--pw-cream); font-weight: 600; }
    }
    .no-photos {
      column-span: all;
      text-align: center; padding: 4rem 2rem;
      color: rgba(248,247,255,0.4);
    }
  `]
})
export class GalleryComponent implements OnInit, OnDestroy {
  private route         = inject(ActivatedRoute);
  private guestService  = inject(GuestService);
  private photosService = inject(PhotosService);
  private eventsService = inject(EventsService);
  private fb            = inject(FormBuilder);

  slug    = signal('');
  event   = signal<PhotoWallEvent | null>(null);
  photos  = signal<Photo[]>([]);
  loading = signal(true);
  joiningLoading = signal(false);
  hasSession = signal(false);

  joinForm = this.fb.nonNullable.group({
    name: ['', Validators.required]
  });

  private pollInterval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.slug.set(slug);
    this.hasSession.set(this.guestService.hasSession(slug));
    this.eventsService.getEventBySlug(slug).subscribe({
      next: (ev) => { this.event.set(ev); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
    if (this.hasSession()) {
      this.loadPhotos();
      this.startPolling();
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  join() {
    if (this.joinForm.invalid) return;
    const event = this.event();
    if (!event) return;
    this.joiningLoading.set(true);
    this.guestService
      .join(event._id, this.slug(), this.joinForm.getRawValue())
      .subscribe({
        next: () => {
          this.hasSession.set(true);
          this.joiningLoading.set(false);
          this.loadPhotos();
          this.startPolling();
        },
        error: (err) => {
          console.error(err);
          this.joiningLoading.set(false);
        }
      });
  }

  onFileSelected(event: globalThis.Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const session = this.guestService.getSession(this.slug());
    if (!session) return;
    Array.from(input.files).forEach(file => {
      this.photosService
        .uploadPhoto(session.eventId, session.guestId, file)
        .subscribe({
          next: () => this.loadPhotos()
        });
    });
  }

  private loadPhotos() {
    if (!this.event()) return;
    this.photosService
      .getPhotosByEvent(this.event()!._id)
      .subscribe({
        next: (photos) => this.photos.set(photos)
      });
  }

  private startPolling() {
    this.pollInterval = setInterval(() => this.loadPhotos(), 5000);
  }
}
