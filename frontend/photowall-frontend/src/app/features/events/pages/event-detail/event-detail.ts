import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../../../core/services/events';
import { PhotosService } from '../../../../core/services/photos';
import { Photo } from '../../../../shared/models/Photo.model';
import { PhotoWallEvent } from '../../../../shared/models/Event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-page">
      @if (loading()) {
        <div class="loading-state"><div class="pw-spinner"></div></div>
      }

      @if (event()) {
        <!-- Hero: portada + foto de perfil + título + fecha -->
        <div class="event-hero">
          <div class="hero-cover"
               [style.backgroundImage]="'url(' + event()!.coverImage + ')'">
            <div class="hero-overlay"></div>
          </div>
          <a routerLink="/dashboard" class="back-link back-link--hero">← Mis eventos</a>
          <div class="hero-content">
            @if (event()!.profileImage) {
              <div class="hero-avatar">
                <img [src]="event()!.profileImage" [alt]="event()!.name">
              </div>
            }
            <div class="event-type-badge">{{ event()!.type }}</div>
            <h1 class="hero-title">{{ event()!.name }}</h1>
            <div class="hero-date">
              <i class="bi bi-calendar-event"></i>
              <span>{{ event()!.date | date:'dd MMMM yyyy' }}</span>
            </div>
            <div class="event-actions">
              <a [href]="'/projection/' + event()!.slug" target="_blank" class="btn-pw-ghost">
                <i class="bi bi-display"></i> Proyectar
              </a>
              <a [href]="'/e/' + event()!.slug" target="_blank" class="btn-pw-primary">
                <i class="bi bi-box-arrow-up-right"></i> Ver galería
              </a>
            </div>
          </div>
        </div>

        <div class="detail-inner">
          <!-- QR Panel -->
          <div class="qr-panel pw-card">
            <div class="qr-section">
              <h3>Código QR del evento</h3>
              <p>Comparte este QR con tus invitados para que puedan subir fotos</p>
              <div class="qr-placeholder">
                <img [src]="event()!.qrCode" alt="QR del evento"
                     onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=test'">
              </div>
              <a [href]="event()!.qrCode" download="qr-{{ event()!.slug }}.png"
                 class="btn-pw-ghost btn-sm">
                <i class="bi bi-download"></i> Descargar QR
              </a>
            </div>
            <div class="link-section">
              <h4>Enlace directo</h4>
              <div class="event-link">
                <code>{{ guestUrl() }}</code>
                <button (click)="copyLink()" class="copy-btn">
                  {{ copied() ? '✓ Copiado' : 'Copiar' }}
                </button>
              </div>
              <div class="stats-row">
                <div class="stat">
                  <div class="stat-value">{{ event()!.photoCount }}</div>
                  <div class="stat-label">Fotos</div>
                </div>
                <div class="stat">
                  <div class="stat-value">
                    <span [class.active-dot]="event()!.isActive">
                      {{ event()!.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <div class="stat-label">Estado</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fotos -->
          <div class="photos-section">
            <h3>Fotos del evento ({{ photos().length }})</h3>
            @if (photos().length === 0) {
              <div class="no-photos-yet">
                <p>Aún no hay fotos. Cuando los invitados empiecen a subir, aparecerán aquí.</p>
              </div>
            } @else {
              <div class="admin-photo-grid">
                @for (photo of photos(); track photo._id) {
                  <div class="admin-photo">
                    <div class="admin-photo-img">
                      <img [src]="photo.imageUrl" [alt]="'Foto de ' + photo.uploadedBy" loading="lazy">
                    </div>
                    <div class="admin-photo-caption">
                      <span><i class="bi bi-person-circle"></i> Subido por: <strong>{{ photo.uploadedBy }}</strong></span>
                      <button (click)="deletePhoto(photo._id)" class="delete-btn" title="Eliminar foto">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page { min-height: 100vh; background: var(--pw-ink); }
    .detail-inner { max-width: 960px; margin: 0 auto; padding: 0 2rem 4rem; }
    .loading-state { display: flex; justify-content: center; padding: 6rem 0; }

    /* ---- Hero ---- */
    .event-hero { position: relative; margin-bottom: 1rem; }
    .hero-cover {
      height: 280px;
      background-size: cover; background-position: center;
      background-color: var(--pw-ink-soft);
      position: relative;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(13,13,20,0.15) 0%, rgba(13,13,20,0.6) 60%, var(--pw-ink) 100%);
    }
    .back-link {
      color: rgba(248,247,255,0.7); font-size: 0.875rem;
    }
    .back-link--hero {
      position: absolute; top: 1.5rem; left: 2rem; z-index: 2;
      background: rgba(13,13,20,0.5); backdrop-filter: blur(6px);
      padding: 0.4rem 0.9rem; border-radius: 100px;
    }
    .hero-content {
      position: relative; margin-top: -72px; padding: 0 2rem 1.5rem;
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .hero-avatar {
      width: 116px; height: 116px; border-radius: 50%; overflow: hidden;
      border: 4px solid var(--pw-ink);
      box-shadow: 0 0 0 1px rgba(124,58,237,0.45), 0 10px 30px rgba(0,0,0,0.45);
      background: var(--pw-ink-soft); margin-bottom: 0.75rem;
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    }
    .event-type-badge {
      display: inline-block; text-transform: capitalize;
      background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
      color: #A78BFA; font-size: 0.7rem; font-weight: 600;
      padding: 3px 10px; border-radius: 100px; margin-bottom: 0.6rem;
    }
    .hero-title { font-size: 2rem; margin: 0 0 0.4rem; }
    .hero-date {
      display: inline-flex; align-items: center; gap: 0.4rem;
      color: rgba(248,247,255,0.6); font-size: 0.9rem; margin-bottom: 1.25rem;
      i { color: var(--pw-rose); }
    }
    .event-actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }

    /* ---- QR panel ---- */
    .qr-panel { display: flex; gap: 3rem; flex-wrap: wrap; margin-bottom: 3rem; }
    .qr-section {
      display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center;
      h3 { font-family: 'Syne', sans-serif; font-size: 1.1rem; margin: 0; }
      p { color: rgba(248,247,255,0.55); font-size: 0.85rem; max-width: 200px; margin: 0; }
    }
    .qr-placeholder {
      width: 160px; height: 160px; border-radius: 12px; overflow: hidden;
      background: #F8F7FF; display: flex; align-items: center; justify-content: center;
      img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }
    }
    .link-section { flex: 1; min-width: 260px; }
    .event-link {
      display: flex; gap: 0.5rem; align-items: center;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 0.75rem 1rem; margin: 0.75rem 0 1.5rem;
      code { flex: 1; font-size: 0.8rem; color: rgba(248,247,255,0.7); word-break: break-all; }
    }
    .copy-btn {
      background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.35);
      color: #A78BFA; border-radius: 6px; padding: 4px 10px;
      font-size: 0.75rem; cursor: pointer; white-space: nowrap;
    }
    .stats-row { display: flex; gap: 2rem; }
    .stat-value { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 700; }
    .stat-label { color: rgba(248,247,255,0.4); font-size: 0.8rem; margin-top: 0.2rem; }
    .active-dot { color: #5dcaa5; }

    /* ---- Fotos ---- */
    .photos-section h3 { font-family: 'Syne', sans-serif; font-size: 1.2rem; margin-bottom: 1.5rem; }
    .no-photos-yet {
      border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;
      padding: 3rem; text-align: center; color: rgba(248,247,255,0.4);
    }
    .admin-photo-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem;
    }
    .admin-photo {
      border-radius: 14px; overflow: hidden;
      background: var(--pw-card-bg); border: 1px solid var(--pw-card-border);
      transition: border-color 0.2s, transform 0.2s;
      &:hover { border-color: rgba(124,58,237,0.4); transform: translateY(-3px); }
    }
    .admin-photo-img { aspect-ratio: 1; overflow: hidden; }
    .admin-photo-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .admin-photo-caption {
      display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
      padding: 0.6rem 0.75rem;
      span { font-size: 0.75rem; color: rgba(248,247,255,0.65); display: flex; align-items: center; gap: 0.35rem; }
      i.bi-person-circle { color: var(--pw-violet-light); }
      strong { color: var(--pw-cream); font-weight: 600; }
    }
    .delete-btn {
      background: rgba(226,75,74,0.15); border: 1px solid rgba(226,75,74,0.35);
      color: #f09595; border-radius: 6px; padding: 4px 8px; cursor: pointer;
      font-size: 0.75rem; flex-shrink: 0;
      &:hover { background: rgba(226,75,74,0.28); }
    }
  `]
})
export class EventDetailComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private evSvc    = inject(EventsService);
  private photoSvc = inject(PhotosService);

  event   = signal<PhotoWallEvent | null>(null);
  photos  = signal<Photo[]>([]);
  loading = signal(true);
  copied  = signal(false);

  guestUrl = () => `${window.location.origin}/e/${this.event()?.slug}`;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.evSvc.getEventById(id).subscribe({
      next: (ev) => {
        this.event.set(ev);
        this.loading.set(false);
        this.photoSvc.getPhotosByEvent(ev._id).subscribe(photos => this.photos.set(photos));
      },
      error: () => this.loading.set(false)
    });
  }

  copyLink() {
    navigator.clipboard.writeText(this.guestUrl()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  deletePhoto(id: string) {
    if (!confirm('¿Eliminar esta foto?')) return;
    this.photoSvc.deletePhoto(id).subscribe(() => {
      this.photos.update(p => p.filter(ph => ph._id !== id));
    });
  }
}
