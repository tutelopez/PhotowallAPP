import { Component,computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../core/services/guest';
import { PhotosService } from '../../core/services/photos';
import { EventsService } from '../../core/services/events';
import { PhotoWallEvent } from '../../shared/models/Event.model';
import { Photo } from '../../shared/models/Photo.model';
import { MessagesService } from '../../core/services/messages';
import { SocketService } from '../../core/services/socket';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
   <div class="gallery-page" [style.--pw-violet]="accentColor()">
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
              @if (photosLimitReached()) {
  <div class="limit-banner">
    📸 Este evento alcanzó el límite de fotos de su plan. ¡Pero igual podés seguir disfrutando la galería!
  </div>
} @else {
              <input type="file" id="photo-upload" accept="image/*,video/*" multiple
       (change)="onFileSelected($event)" hidden #fileInput>
              <button class="btn-pw-primary" (click)="fileInput.click()">
                <i class="bi bi-camera"></i> Subir foto
              </button>}
              @if (videoTooLong()) {
  <div class="limit-banner">🎥 El video supera los 30 segundos permitidos.</div>
}
            </div>
          </div>
        </div>

        <div class="comment-section">
          @if (messagesLimitReached()) {
  <div class="limit-banner">💬 Se alcanzó el límite de mensajes de este evento.</div>
} @else {
  <form [formGroup]="commentForm" (ngSubmit)="sendComment()" class="comment-form">
    <i class="bi bi-chat-heart"></i>
    <input type="text" formControlName="text" maxlength="200"
           placeholder="Escribe un mensaje para la pantalla de proyección…"
           class="comment-input">
    <button type="submit" class="comment-send"
            [disabled]="commentForm.invalid || sendingComment()">
      <i class="bi bi-send-fill"></i>
    </button>
  </form>
  @if (commentSent()) {
    <div class="comment-toast">¡Tu mensaje aparecerá en la pantalla! ✨</div>
  }
  @if (commentError()) {
  <div class="limit-banner">{{ commentError() }}</div>
}
}
 <div class="emoji-bar">
    @for (e of emojiOptions; track e) {
      <button type="button" class="emoji-btn" (click)="sendEmoji(e)" [class.emoji-btn--pop]="lastEmojiSent() === e">
        {{ e }}
      </button>
    }
  </div>
</div>

        <!-- Galería -->
        <div class="photo-grid">
          @for (photo of photos(); track photo._id) {
  <div class="grid-photo">
    <div class="photo-img-wrap">
      @if (photo.type === 'video') {
        <video [src]="photo.imageUrl" controls muted playsinline></video>
      } @else {
        <img [src]="photo.imageUrl"
             [alt]="'Foto de ' + photo.uploadedBy"
             loading="lazy">
      }
    </div>
    <div class="photo-caption">
      <i class="bi" [class.bi-person-circle]="photo.type !== 'video'" [class.bi-camera-reels]="photo.type === 'video'"></i>
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

    .comment-section {
  padding: 0 2rem 1rem; max-width: 1200px; margin: 0 auto;
}
.comment-form {
  display: flex; align-items: center; gap: 0.6rem;
  background: var(--pw-card-bg); border: 1px solid var(--pw-card-border);
  border-radius: 100px; padding: 0.5rem 0.5rem 0.5rem 1.1rem;
  margin-top: 1rem;
  i.bi-chat-heart { color: var(--pw-rose); }
}
.comment-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--pw-cream); font-size: 0.9rem;
  &::placeholder { color: rgba(248,247,255,0.35); }
}
.emoji-bar {
  display: flex; justify-content: center; flex-wrap: wrap; gap: 0.5rem;
  margin-top: 0.85rem;
}
.emoji-btn {
  background: var(--pw-card-bg); border: 1px solid var(--pw-card-border);
  border-radius: 14px; width: 46px; height: 46px; font-size: 1.4rem;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  &:hover { background: rgba(124,58,237,0.18); transform: translateY(-2px); }
  &:active { transform: scale(0.9); }
}
.emoji-btn--pop { animation: emoji-btn-pop 0.4s ease; }
@keyframes emoji-btn-pop {
  0% { transform: scale(1); }
  35% { transform: scale(1.35); }
  100% { transform: scale(1); }
}
.comment-send {
  background: var(--pw-violet); color: var(--pw-cream); border: none;
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  &:hover:not(:disabled) { background: #6D28D9; transform: translateY(-1px); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}
.comment-toast {
  margin-top: 0.6rem; font-size: 0.8rem; color: var(--pw-violet-light);
  text-align: center;
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
    .limit-banner {
  background: rgba(244,63,94,0.12); border: 1px solid rgba(244,63,94,0.35);
  color: var(--pw-rose); border-radius: 12px; padding: 0.8rem 1rem;
  font-size: 0.85rem; text-align: center; margin: 1rem 0;
}
.photo-img-wrap video { width: 100%; display: block; background: #000; }
  `]
})
export class GalleryComponent implements OnInit, OnDestroy {
  private route         = inject(ActivatedRoute);
  private guestService  = inject(GuestService);
  private photosService = inject(PhotosService);
  private eventsService = inject(EventsService);
  private fb            = inject(FormBuilder);
  private socketService = inject(SocketService);

  emojiOptions = ['❤️', '😂', '🎉', '🔥', '👏', '😍', '🥳', '👍'];
  lastEmojiSent = signal<string | null>(null);
  slug    = signal('');
  event   = signal<PhotoWallEvent | null>(null);
  photos  = signal<Photo[]>([]);
  loading = signal(true);
  joiningLoading = signal(false);
  hasSession = signal(false);
  videoTooLong = signal(false);
  commentError = signal<string | null>(null);

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

  photosLimitReached = computed(() => {
  const u = this.event()?.usage;
  return !!u && u.maxPhotos !== null && u.currentPhotos >= u.maxPhotos;
});
messagesLimitReached = computed(() => {
  const u = this.event()?.usage;
  return !!u && u.maxMessages !== null && u.currentMessages >= u.maxMessages;
});
accentColor = computed(() => this.event()?.branding?.accentColor || null);

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
    if (file.type.startsWith('video/')) {
      this.validateVideoDuration(file).then(ok => {
        if (!ok) {
          this.videoTooLong.set(true);
          setTimeout(() => this.videoTooLong.set(false), 4000);
          return;
        }
        this.uploadFile(session, file);
      });
    } else {
      this.uploadFile(session, file);
    }
  });
  input.value = '';
}
private uploadFile(session: { eventId: string; guestId: string }, file: File) {
  this.photosService
    .uploadPhoto(session.eventId, session.guestId, file)
    .subscribe({
      next: () => this.loadPhotos()
    });
}
private validateVideoDuration(file: File): Promise<boolean> {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration <= 30);
    };
    video.onerror = () => resolve(false);
    video.src = URL.createObjectURL(file);
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

  private messagesService = inject(MessagesService);
commentForm = this.fb.nonNullable.group({
  text: ['', [Validators.required, Validators.maxLength(200)]]
});



sendingComment = signal(false);
commentSent = signal(false);
sendComment() {
  if (this.commentForm.invalid) return;
  const session = this.guestService.getSession(this.slug());
  const event = this.event();
  if (!session || !event) return;
  this.sendingComment.set(true);
  this.messagesService
    .sendMessage(event._id, session.guestId, this.commentForm.getRawValue().text)
    .subscribe({
      next: () => {
        this.sendingComment.set(false);
        this.commentForm.reset();
        this.commentSent.set(true);
        setTimeout(() => this.commentSent.set(false), 2500);
      },
     error: (err) => {
  this.sendingComment.set(false);
  this.commentError.set(err?.error?.message || 'No se pudo enviar el mensaje');
  setTimeout(() => this.commentError.set(null), 4000);
}
    });
}

sendEmoji(emoji: string) {
  const session = this.guestService.getSession(this.slug());
  if (!session) return;
  this.socketService.sendEmoji(session.eventId, emoji);
  this.lastEmojiSent.set(emoji);
  setTimeout(() => {
    if (this.lastEmojiSent() === emoji) this.lastEmojiSent.set(null);
  }, 400);
}
}
