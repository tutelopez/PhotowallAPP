import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhotosService } from '../../core/services/photos';
import { EventsService } from '../../core/services/events';
import { SocketService, NewPhotoEvent } from '../../core/services/socket';
import { PhotoWallEvent } from '../../shared/models/Event.model';
import { Photo } from '../../shared/models/Photo.model';
import { NewMessageEvent, MessagesToggleEvent } from '../../core/services/socket';

interface CommentBubble {
  key: string;
  author: string;
  text: string;
  visible: boolean;
}

interface Slide {
  key: string;
  photo: Photo;
  zoomIn: boolean;
  visible: boolean;
}

interface Spark {
  hue: 'violet' | 'rose' | 'cream';
  style: string;
}

const SLIDE_DURATION = 6000;
const CROSSFADE_DURATION = 1800;
const MESSAGE_DURATION = SLIDE_DURATION * 2; // 12000ms — el doble que una foto

@Component({
  selector: 'app-projection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="projection-view">

      <!-- Header -->
      <div class="proj-header">
        <div class="proj-logo"><span class="logo-dot"></span> PhotoWall</div>
        @if (event()) {
          <div class="proj-event-name">{{ event()!.name }}</div>
        }
        <div class="proj-header-right">
          <div class="badge-live" [class.badge-live--offline]="!liveConnected()">
            <span class="dot"></span>
            {{ liveConnected() ? 'En vivo' : 'Conectando…' }} · {{ photos().length }} fotos
          </div>
          <button class="fullscreen-btn" (click)="toggleFullscreen()" title="Pantalla completa">
            <i class="bi" [class.bi-arrows-fullscreen]="!isFullscreen()" [class.bi-fullscreen-exit]="isFullscreen()"></i>
          </button>
        </div>
      </div>

      <!-- Lluvia de chispas -->
      <div class="spark-field" aria-hidden="true">
        @for (s of sparks; track $index) {
          <span class="spark spark--{{ s.hue }}" [attr.style]="s.style"></span>
        }
      </div>

      <!-- Escenario de fotos -->
      <div class="proj-stage">
        @for (slide of slides(); track slide.key) {
          <div class="proj-slide"
               [class.proj-slide--visible]="slide.visible"
               [class.proj-slide--zoom-in]="slide.zoomIn"
               [class.proj-slide--zoom-out]="!slide.zoomIn"
               [style.backgroundImage]="'url(' + slide.photo.imageUrl + ')'">
          </div>
        }

        @if (currentSlide(); as cs) {
          <div class="proj-credit" [class.proj-credit--visible]="cs.visible">
            <i class="bi bi-camera-fill"></i>
            <span>Subido por: <strong>{{ cs.photo.uploadedBy }}</strong></span>
          </div>
        }

        @if (activeComment(); as cm) {
  <div class="comment-bubble" [class.comment-bubble--visible]="cm.visible">
    <i class="bi bi-chat-heart-fill"></i>
    <span><strong>{{ cm.author }}</strong> dice: <em>"{{ cm.text }}"</em></span>
  </div>
}

        @if (photos().length === 0) {
          <div class="proj-empty">
            <div class="proj-empty-icon">📸</div>
            <h2>Esperando fotos...</h2>
            <p>Los invitados pueden escanear el QR del evento para empezar a subir fotos</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .projection-view {
      min-height: 100vh;
      background: #05050a;
      color: #F8F7FF;
      display: flex; flex-direction: column;
      position: relative;
      overflow: hidden;
    }

      .comment-bubble {
  position: absolute; top: 2.2rem; left: 50%;
  transform: translate(-50%, -18px) scale(0.92);
  z-index: 15; max-width: min(680px, 80vw);
  display: inline-flex; align-items: center; gap: 0.7rem;
  background: rgba(124,58,237,0.22);
  border: 1px solid rgba(167,139,250,0.45);
  backdrop-filter: blur(14px);
  border-radius: 100px;
  padding: 0.85rem 1.75rem;
  box-shadow: 0 12px 40px rgba(124,58,237,0.35);
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  i.bi-chat-heart-fill { color: var(--pw-rose); font-size: 1.1rem; flex-shrink: 0; }
  span { font-size: 1.05rem; color: var(--pw-cream); }
  strong { color: var(--pw-cream); font-weight: 700; }
  em { color: rgba(248,247,255,0.85); font-style: normal; }
}
.comment-bubble--visible {
  opacity: 1; transform: translate(-50%, 0) scale(1);
  animation: bubble-float 12s ease-in-out infinite;
}
@keyframes bubble-float {
  0%, 100% { transform: translate(-50%, 0) scale(1); }
  50%      { transform: translate(-50%, -6px) scale(1); }
}

    .proj-header {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 1rem 2rem;
      background: rgba(0,0,0,0.45);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      backdrop-filter: blur(12px);
      position: relative; z-index: 20;
    }
    .proj-logo {
      font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .logo-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--pw-rose);
      box-shadow: 0 0 8px 2px rgba(244,114,182,0.6);
    }
    .proj-event-name { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; }
    .proj-header-right { display: flex; align-items: center; gap: 0.9rem; }
    .badge-live--offline {
      color: rgba(248,247,255,0.4);
      border-color: rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.03);
      .dot { animation: none; background: rgba(248,247,255,0.3); }
    }
    .fullscreen-btn {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
      color: rgba(248,247,255,0.8); width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: border-color 0.2s, color 0.2s, transform 0.15s;
      &:hover { border-color: rgba(124,58,237,0.5); color: var(--pw-cream); transform: translateY(-1px); }
    }

    .proj-stage {
      position: relative; flex: 1; overflow: hidden;
    }
    .proj-stage::after {
      content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 4;
      background: radial-gradient(ellipse at center, transparent 50%, rgba(5,5,10,0.6) 100%);
    }
    .proj-slide {
      position: absolute; inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transform-origin: center;
      transition: opacity 1.8s ease, transform 7.8s ease-out;
      will-change: opacity, transform;
    }
    .proj-slide--zoom-in            { transform: scale(1.16); }
    .proj-slide--zoom-in.proj-slide--visible  { transform: scale(1); }
    .proj-slide--zoom-out           { transform: scale(1); }
    .proj-slide--zoom-out.proj-slide--visible { transform: scale(1.16); }
    .proj-slide--visible { opacity: 1; }

    .proj-credit {
      position: absolute; left: 50%; bottom: 2.5rem; transform: translateX(-50%);
      z-index: 6;
      display: inline-flex; align-items: center; gap: 0.6rem;
      background: rgba(13,13,20,0.55);
      border: 1px solid rgba(255,255,255,0.14);
      backdrop-filter: blur(10px);
      padding: 0.65rem 1.5rem; border-radius: 100px;
      font-size: 1rem; color: rgba(248,247,255,0.85);
      opacity: 0; transition: opacity 1.2s ease 0.35s;
      i { color: var(--pw-rose); }
      strong { color: var(--pw-cream); font-weight: 700; }
    }
    .proj-credit--visible { opacity: 1; }

    .spark-field {
      position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 5;
    }
    .spark {
      position: absolute;
      bottom: -6%;
      border-radius: 50%;
      opacity: 0;
      filter: blur(0.4px);
      animation-name: spark-rise;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }
    .spark--violet { background: var(--pw-violet-light); box-shadow: 0 0 7px 1px rgba(167,139,250,0.55); }
    .spark--rose   { background: var(--pw-rose);         box-shadow: 0 0 7px 1px rgba(244,114,182,0.55); }
    .spark--cream  { background: var(--pw-cream);        box-shadow: 0 0 6px 1px rgba(248,247,255,0.45); }
    @keyframes spark-rise {
      0%   { transform: translate(0, 0); opacity: 0; }
      8%   { opacity: 0.5; }
      50%  { transform: translate(var(--drift), -55vh); opacity: 0.32; }
      92%  { opacity: 0.12; }
      100% { transform: translate(calc(var(--drift) * 1.6), -108vh); opacity: 0; }
    }

    .proj-empty {
      position: absolute; inset: 0; z-index: 6;
      display: flex; flex-direction: column;
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
  private socketService = inject(SocketService);

  event  = signal<PhotoWallEvent | null>(null);
  photos = signal<Photo[]>([]);
  slides = signal<Slide[]>([]);
  isFullscreen   = signal(false);
  liveConnected  = signal(false);

  sparks: Spark[] = this.generateSparks(42);

  currentSlide = computed(() => {
    const list = this.slides();
    return list.length ? list[list.length - 1] : null;
  });

  private eventId = '';
  private currentIndex = -1;
  private lastZoomIn = false;
  private slideTimer?: ReturnType<typeof setInterval>;
  private pollTimer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    document.addEventListener('fullscreenchange', this.onFullscreenChange);

    this.eventsService.getEventBySlug(slug).subscribe(ev => {
      this.event.set(ev);
      this.eventId = ev._id;

      // Conexión en tiempo real
      this.socketService.joinEvent(ev._id);
      this.socketService.onNewPhoto(photo => this.handleNewPhoto(photo));
      this.socketService.onConnectionChange(connected => this.liveConnected.set(connected));
      this.messagesEnabled.set(ev.messagesEnabled ?? true);
      this.socketService.onNewMessage(msg => this.handleNewMessage(msg));
      this.socketService.onMessageDeleted(({ _id }) => this.handleMessageDeleted(_id));
      this.socketService.onMessagesToggle(payload => this.messagesEnabled.set(payload.enabled));
      // Carga inicial + respaldo por si el socket se desconecta
      this.loadPhotos(ev._id);
      this.pollTimer = setInterval(() => this.loadPhotos(ev._id), 20000);

    });
  }

  ngOnDestroy() {
    if (this.slideTimer) clearInterval(this.slideTimer);
    if (this.pollTimer) clearInterval(this.pollTimer);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    this.socketService.disconnect();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  private onFullscreenChange = () => {
    this.isFullscreen.set(!!document.fullscreenElement);
  };

  private loadPhotos(eventId: string) {
    this.photosService.getPhotosByEvent(eventId).subscribe(photos => {
      const hadNone = this.photos().length === 0;
      this.photos.set(photos);
      if (hadNone && photos.length && !this.slideTimer) {
        this.startSlideshow();
      }
    });
  }

  private handleNewMessage(payload: NewMessageEvent) {
  if (!this.messagesEnabled()) return;
  this.messageQueue.push({
    key: `${payload._id}-${Date.now()}`,
    author: payload.authorName,
    text: payload.text,
    visible: false
  });
  if (this.messageQueue.length > 5) this.messageQueue.shift();
  if (!this.showingMessage) this.processMessageQueue();
}
private processMessageQueue() {
  const next = this.messageQueue.shift();
  if (!next) {
    this.showingMessage = false;
    return;
  }
  this.showingMessage = true;
  this.activeComment.set(next);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    this.activeComment.update(c => (c && c.key === next.key ? { ...c, visible: true } : c));
  }));
  setTimeout(() => {
    this.activeComment.update(c => (c && c.key === next.key ? { ...c, visible: false } : c));
    setTimeout(() => {
      this.activeComment.set(null);
      this.processMessageQueue();
    }, 700);
  }, MESSAGE_DURATION);
}

  /** Llega por socket cuando un invitado sube una foto nueva */
  private handleNewPhoto(payload: NewPhotoEvent) {
    if (this.photos().some(p => p._id === payload._id)) return; // evita duplicados

    const photo: Photo = {
      _id: payload._id,
      event: this.eventId,
      uploadedBy: payload.uploadedBy,
      imageUrl: payload.imageUrl,
      publicId: '',
      createdAt: payload.createdAt,
      updatedAt: payload.createdAt
    };

    const wasEmpty = this.photos().length === 0;
    this.photos.update(list => [...list, photo]);

    if (wasEmpty) {
      this.startSlideshow();
      return;
    }

    // Interrumpe el ciclo actual y muestra la foto nueva de inmediato
    this.advance(photo);
    this.restartTimer();
  }

  private startSlideshow() {
    this.advance();
    this.restartTimer();
  }
activeComment = signal<CommentBubble | null>(null);
messagesEnabled = signal(true);
private messageQueue: CommentBubble[] = [];
private showingMessage = false;

  private restartTimer() {
    if (this.slideTimer) clearInterval(this.slideTimer);
    this.slideTimer = setInterval(() => this.advance(), SLIDE_DURATION);
  }

  private advance(forcedPhoto?: Photo) {
    const photos = this.photos();
    if (!photos.length) return;

    let photo: Photo;
    if (forcedPhoto) {
      photo = forcedPhoto;
      this.currentIndex = photos.findIndex(p => p._id === forcedPhoto._id);
    } else {
      this.currentIndex = (this.currentIndex + 1) % photos.length;
      photo = photos[this.currentIndex];
    }

    this.lastZoomIn = !this.lastZoomIn;

    const slide: Slide = {
      key: `${photo._id}-${Date.now()}`,
      photo,
      zoomIn: this.lastZoomIn,
      visible: false
    };

    this.slides.update(list => [...list, slide]);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.slides.update(list =>
        list.map(s => (s.key === slide.key ? { ...s, visible: true } : s))
      );
    }));

    setTimeout(() => {
      this.slides.update(list => list.filter(s => s.key === slide.key));
    }, CROSSFADE_DURATION + 150);
  }
  
private handleMessageDeleted(id: string) {
  this.messageQueue = this.messageQueue.filter(m => !m.key.startsWith(id));
  const current = this.activeComment();
  if (current && current.key.startsWith(id)) {
    this.activeComment.update(c => (c ? { ...c, visible: false } : c));
    setTimeout(() => {
      this.activeComment.set(null);
      this.processMessageQueue();
    }, 700);
  }
}
  private generateSparks(count: number): Spark[] {
    const hues: Spark['hue'][] = ['violet', 'rose', 'cream'];
    return Array.from({ length: count }, () => {
      const left = Math.random() * 100;
      const size = 2 + Math.random() * 3;
      const duration = 14 + Math.random() * 14;
      const delay = -Math.random() * 26;
      const drift = Math.round((Math.random() - 0.5) * 70);
      const hue = hues[Math.floor(Math.random() * hues.length)];
      const style =
        `left:${left}%; width:${size}px; height:${size}px; ` +
        `animation-duration:${duration}s; animation-delay:${delay}s; --drift:${drift}px;`;
      return { hue, style };
    });
  }
}
