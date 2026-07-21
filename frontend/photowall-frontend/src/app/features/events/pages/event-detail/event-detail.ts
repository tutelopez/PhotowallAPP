import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../../../core/services/events';
import { PhotosService } from '../../../../core/services/photos';
import { Photo } from '../../../../shared/models/Photo.model';
import { PhotoWallEvent } from '../../../../shared/models/Event.model';
import { MessagesService } from '../../../../core/services/messages';
import { SocketService, NewPhotoEvent, GuestJoinedEvent } from '../../../../core/services/socket';
import { GuestMessage } from '../../../../shared/models/Message.model';
import { ToastService } from '../../../../core/services/toast'; // 👈 nuevo
import { PLAN_CATALOG, PLAN_LABELS, PlanType } from '../../../../shared/models/Plan.model';
import {FormsModule} from '@angular/forms';
import { PaymentsService } from '../../../../core/services/payments';
import { BoldCheckoutService } from '../../../../core/services/bold-checkout';

interface ActivityNotification {
  id: string;
  type: 'photo' | 'message' | 'guest';
  title: string;
  text: string;
  leaving?: boolean;
}
const TOAST_DURATION = 6000;
const TOAST_LEAVE_ANIM = 300;
const MAX_ACTIVITY_LOG = 30;
@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="detail-page">
      <!-- Notificaciones en tiempo real -->
      <div class="notif-stack" aria-live="polite">
        @for (n of notifications(); track n.id) {
          <div class="notif-toast" [class.notif-toast--leaving]="n.leaving">
            <div class="notif-icon notif-icon--{{ n.type }}">
              <i class="bi" [class.bi-camera-fill]="n.type === 'photo'" [class.bi-chat-heart-fill]="n.type === 'message'" [class.bi-person-plus-fill]="n.type === 'guest'"></i>
            </div>
            <div class="notif-body">
              <strong>{{ n.title }}</strong>
              <span>{{ n.text }}</span>
            </div>
            <button class="notif-close" (click)="dismissNotification(n.id)" title="Cerrar">
              <i class="bi bi-x"></i>
            </button>
          </div>
        }
      </div>
      @if (loading()) {
         <!-- Skeleton de toda la página -->
  <div class="hero-skeleton shimmer"></div>
  <div class="detail-inner">
    <div class="skel-block skel-plan shimmer"></div>
    <div class="skel-block skel-branding shimmer"></div>
    <div class="skel-block skel-qr shimmer"></div>
    <div class="admin-photo-grid">
      @for (i of skeletonPhotos; track i) {
        <div class="admin-photo skeleton-photo shimmer"></div>
      }
    </div>
  </div>
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
              <button class="btn-pw-ghost" (click)="toggleMessages()" [disabled]="togglingMessages()">
                <i class="bi" [class.bi-chat-dots-fill]="event()!.messagesEnabled" [class.bi-chat-dots]="!event()!.messagesEnabled"></i>
                {{ event()!.messagesEnabled ? 'Mensajes activados' : 'Mensajes desactivados' }}
              </button>
              <div class="bell-wrapper">
                <button class="btn-pw-ghost bell-btn" (click)="toggleActivityPanel()">
                  <i class="bi bi-bell-fill"></i> Actividad
                  @if (unreadCount() > 0) {
                    <span class="bell-badge">{{ unreadCount() }}</span>
                  }
                </button>
                @if (showActivityPanel()) {
                  <div class="activity-panel">
                    <div class="activity-panel-header">
                      <span>Actividad reciente</span>
                      @if (activityLog().length > 0) {
                        <button class="activity-clear" (click)="clearActivity()">Limpiar</button>
                      }
                    </div>
                    @if (activityLog().length === 0) {
                      <p class="activity-empty">Sin actividad todavía.</p>
                    } @else {
                      @for (n of activityLog(); track n.id) {
                        <div class="activity-item">
                          <div class="notif-icon notif-icon--{{ n.type }}">
                            <i class="bi" [class.bi-camera-fill]="n.type === 'photo'" [class.bi-chat-heart-fill]="n.type === 'message'" [class.bi-person-plus-fill]="n.type === 'guest'"></i>
                          </div>
                          <div class="notif-body">
                            <strong>{{ n.title }}</strong>
                            <span>{{ n.text }}</span>
                          </div>
                        </div>
                      }
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div class="detail-inner">
          <div class="plan-summary">
            <span class="plan-badge">{{ planLabel() }}</span>
            <div class="usage-bar">
              <span>Fotos: {{ event()!.usage?.currentPhotos }} / {{ event()!.usage?.maxPhotos ?? '∞' }}</span>
              <div class="usage-track">
                <div class="usage-fill" [style.width.%]="photosUsagePercent()"></div>
              </div>
            </div>
            <div class="usage-bar">
              <span>Mensajes: {{ event()!.usage?.currentMessages }} / {{ event()!.usage?.maxMessages ?? '∞' }}</span>
              <div class="usage-track">
                <div class="usage-fill" [style.width.%]="messagesUsagePercent()"></div>
              </div>
            </div>

@if (event()!.pendingPlan) {
  <div class="pending-plan-note">
    ⏳ Procesando tu pago del Plan {{ pendingPlanLabel() }}…
  </div>
  <div class="upgrade-picker">
    <button class="btn-pw-primary btn-sm" (click)="payWithBold()" [disabled]="processingPayment()">
      {{ processingPayment() ? 'Abriendo Bold…' : 'Reintentar pago' }}
    </button>
    <button class="btn-pw-ghost btn-sm" (click)="cancelPendingPlan()" [disabled]="cancelingPlan()">
      {{ cancelingPlan() ? 'Cancelando…' : 'Cancelar' }}
    </button>
  </div>
} @else {
  <div class="upgrade-picker">
    <select [(ngModel)]="upgradeChoice" class="upgrade-select">
      @for (p of plans; track p.plan) {
        @if (p.plan !== event()!.plan && p.plan !== 'free') {
          <option [value]="p.plan">{{ p.name }} — \${{ p.priceCOP | number:'1.0-0' }} COP</option>
        }
      }
    </select>
    <button class="btn-pw-primary btn-sm" (click)="payWithBold()" [disabled]="processingPayment()">
      {{ processingPayment() ? 'Abriendo Bold…' : 'Pagar con Bold' }}
    </button>
  </div>
}


          </div>
          <div class="branding-section pw-card">
  <h4>Color del evento</h4>
  @if (event()!.usage?.branding) {
    <div class="branding-picker">
      <input type="color" [value]="brandingColor()" (input)="onColorChange($event)" class="color-input">
      <span class="color-hex">{{ brandingColor() }}</span>
      <button class="btn-pw-primary btn-sm" (click)="saveBranding()" [disabled]="savingBranding()">
        {{ savingBranding() ? 'Guardando…' : 'Guardar color' }}
      </button>
      @if (brandingSaved()) {
        <span class="comment-sent">✓ Guardado</span>
      }
    </div>
    <p class="branding-hint">Este color se aplicará a los botones y acentos de la galería y la proyección.</p>
  } @else {
    <p class="branding-locked">
      🔒 La personalización de colores está disponible desde el plan Estándar.
      <a href="https://wa.me/57XXXXXXXXXX?text=Quiero%20mejorar%20mi%20plan" target="_blank">Mejorar plan</a>
    </p>
  }
</div>
          <!-- QR Panel -->
          <div class="qr-panel pw-card">

          <div class="qr-section">
  <h3>Código QR del evento</h3>
  <p>Comparte este QR con tus invitados para que puedan subir fotos</p>
  <div class="qr-placeholder">
    <img [src]="event()!.qrCode" alt="QR del evento"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    <div class="qr-error" style="display:none;">⚠️ No se pudo cargar el QR</div>
  </div>
  <div class="qr-actions">
    <a [href]="event()!.qrCode" download="qr-{{ event()!.slug }}.png"
       class="btn-pw-ghost btn-sm">
      <i class="bi bi-download"></i> Descargar QR
    </a>
    <button class="btn-pw-ghost btn-sm" (click)="regenerateQr()" [disabled]="regeneratingQr()">
      @if (regeneratingQr()) {
        <span class="pw-spinner-sm"></span> Regenerando…
      } @else {
        <i class="bi bi-arrow-clockwise"></i> Regenerar QR
      }
    </button>
  </div>
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
            <div class="photos-header">
              <h3>Fotos del evento ({{ photos().length }})</h3>
              @if (photos().length > 0) {
                <button class="btn-pw-ghost btn-sm" (click)="downloadZip()" [disabled]="downloadingZip()">
  @if (downloadingZip()) {
    <span class="pw-spinner-sm"></span> Preparando ZIP…
  } @else {
    <i class="bi bi-file-earmark-zip"></i> Descargar álbum de fotos
  }
</button>
              }
            </div>


           @if (loadingPhotos()) {
  <div class="admin-photo-grid">
    @for (i of skeletonPhotos; track i) {
      <div class="admin-photo skeleton-photo shimmer"></div>
    }
  </div>
} @else if (photos().length === 0) {
  <div class="no-photos-yet">
    <p>Aún no hay fotos. Cuando los invitados empiecen a subir, aparecerán aquí.</p>
  </div>
} @else {
  <div class="admin-photo-grid">
    @for (photo of photos(); track photo._id) {
      <div class="admin-photo">
                    <div class="admin-photo-img">
                      @if (photo.type === 'video') {
                        <video [src]="photo.imageUrl" controls muted playsinline></video>
                      } @else {
                        <img [src]="photo.imageUrl" [alt]="'Foto de ' + photo.uploadedBy" loading="lazy">
                      }
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
          <!-- Mensajes -->
          <div class="messages-section">
            <div class="messages-header">
              <h3>Mensajes de invitados ({{ messages().length }})</h3>
            </div>


           @if (loadingMessages()) {
  <div class="messages-list">
    @for (i of skeletonMessages; track i) {
      <div class="message-row skeleton-message shimmer"></div>
    }
  </div>
} @else if (messages().length === 0) {
  <div class="no-photos-yet">
    <p>Aún no hay mensajes. Aparecerán aquí en cuanto los invitados escriban desde la galería.</p>
  </div>
} @else {
  <div class="messages-list">
    @for (msg of messages(); track msg._id) {
      <div class="message-row">
                    <div class="message-content">
                      <i class="bi bi-chat-heart-fill"></i>
                      <div>
                        <span class="message-author">{{ msg.authorName }}</span>
                        <p class="message-text">"{{ msg.text }}"</p>
                      </div>
                    </div>
                    <button (click)="deleteMessage(msg._id)" class="delete-btn"
                            [disabled]="deletingMessageId() === msg._id" title="Eliminar mensaje">
                      <i class="bi bi-trash"></i>
                    </button>
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
  /* ---- Notificaciones toast ---- */
  .notif-stack {
    position: fixed; top: 1.25rem; right: 1.25rem; z-index: 200;
    display: flex; flex-direction: column; gap: 0.6rem;
    max-width: min(360px, calc(100vw - 2.5rem));
  }
  .notif-toast {
    display: flex; align-items: flex-start; gap: 0.7rem;
    background: var(--pw-card-bg, #14141c); border: 1px solid rgba(124,58,237,0.35);
    border-radius: 12px; padding: 0.8rem 0.9rem;
    box-shadow: 0 12px 30px rgba(0,0,0,0.45);
    animation: notif-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .notif-toast--leaving { animation: notif-out 0.3s ease forwards; }
  @keyframes notif-in {
    from { opacity: 0; transform: translateX(24px) scale(0.96); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes notif-out {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to   { opacity: 0; transform: translateX(24px) scale(0.96); }
  }
  .notif-icon {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 0.95rem;
  }
  .notif-icon--photo   { background: rgba(124,58,237,0.2); color: #A78BFA; }
  .notif-icon--message { background: rgba(244,114,182,0.18); color: var(--pw-rose); }
  .notif-icon--guest   { background: rgba(93,202,165,0.18); color: #5dcaa5; }
  .notif-body { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
  .notif-body strong { font-size: 0.85rem; color: var(--pw-cream); }
  .notif-body span { font-size: 0.8rem; color: rgba(248,247,255,0.65); word-break: break-word; }
  .notif-close {
    background: none; border: none; color: rgba(248,247,255,0.4); cursor: pointer;
    margin-left: auto; padding: 2px; line-height: 1; flex-shrink: 0;
    &:hover { color: rgba(248,247,255,0.8); }
  }
  /* ---- Campana y panel de actividad ---- */
  .bell-wrapper { position: relative; }
  .bell-btn { position: relative; }
  .bell-badge {
    position: absolute; top: -6px; right: -6px;
    background: var(--pw-rose); color: #1a0b14;
    font-size: 0.65rem; font-weight: 800; line-height: 1;
    min-width: 18px; height: 18px; border-radius: 999px;
    display: flex; align-items: center; justify-content: center; padding: 0 4px;
  }
  .activity-panel {
    position: absolute; top: calc(100% + 0.6rem); right: 0; z-index: 50;
    width: 320px; max-height: 380px; overflow-y: auto;
    background: var(--pw-card-bg, #14141c); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    padding: 0.5rem;
  }
  .activity-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.5rem 0.6rem 0.6rem; font-size: 0.8rem; font-weight: 700; color: rgba(248,247,255,0.6);
  }
  .activity-clear {
    background: none; border: none; color: var(--pw-violet-light); font-size: 0.75rem; cursor: pointer;
  }
  .activity-empty { padding: 1rem 0.6rem; font-size: 0.85rem; color: rgba(248,247,255,0.4); text-align: center; margin: 0; }
  .activity-item {
    display: flex; align-items: flex-start; gap: 0.6rem;
    padding: 0.55rem 0.6rem; border-radius: 8px;
    &:hover { background: rgba(255,255,255,0.04); }
  }
  .admin-photo-img video { width: 100%; height: 100%; object-fit: cover; display: block; }
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
    .back-link { color: rgba(248,247,255,0.7); font-size: 0.875rem; }
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
    /* ---- Plan y uso ---- */
    .plan-summary { margin: 1.5rem 0; display: flex; flex-direction: column; gap: 0.6rem; }
    .plan-badge {
      display: inline-block; background: var(--pw-violet); color: var(--pw-cream);
      border-radius: 100px; padding: 0.25rem 0.9rem; font-size: 0.75rem; font-weight: 700;
      width: fit-content;
    }
    .usage-track { height: 6px; border-radius: 4px; background: rgba(248,247,255,0.1); overflow: hidden; margin-top: 0.3rem; }
    .usage-fill { height: 100%; background: var(--pw-rose); transition: width 0.4s ease; }
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
    .photos-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;
    }
    .photos-header h3 { font-family: 'Syne', sans-serif; font-size: 1.2rem; margin: 0; }
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
.branding-section { margin: 1.5rem 0; padding: 1.25rem 1.5rem; }
.branding-section h4 { font-family: 'Syne', sans-serif; font-size: 1rem; margin: 0 0 0.75rem; }
.branding-picker { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.color-input {
  width: 44px; height: 44px; border: none; border-radius: 10px;
  cursor: pointer; background: transparent; padding: 0;
}
.color-hex { font-family: monospace; font-size: 0.85rem; color: rgba(248,247,255,0.6); }
.branding-hint { font-size: 0.8rem; color: rgba(248,247,255,0.45); margin: 0.75rem 0 0; }
.branding-locked {
  font-size: 0.85rem; color: rgba(248,247,255,0.6); margin: 0;
  a { color: var(--pw-violet-light); margin-left: 0.3rem; }
}
    /* ---- Mensajes ---- */
    .messages-section { margin-top: 2.5rem; }
    .messages-header h3 { font-family: 'Syne', sans-serif; font-size: 1.2rem; margin-bottom: 1.5rem; }
    .messages-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .message-row {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
      background: var(--pw-card-bg); border: 1px solid var(--pw-card-border);
      border-radius: 12px; padding: 0.9rem 1.1rem;
      transition: border-color 0.2s;
      &:hover { border-color: rgba(124,58,237,0.35); }
    }
    .message-content { display: flex; align-items: flex-start; gap: 0.7rem; min-width: 0; }
    .message-content i { color: var(--pw-rose); margin-top: 0.2rem; flex-shrink: 0; }
    .message-author { font-size: 0.8rem; font-weight: 700; color: var(--pw-violet-light); }
    .message-text { margin: 0.15rem 0 0; font-size: 0.9rem; color: rgba(248,247,255,0.85); word-break: break-word; }
    .qr-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center; }
    .qr-error { align-items: center; justify-content: center; width: 100%; height: 100%; color: rgba(248,247,255,0.5); font-size: 0.75rem; text-align: center; padding: 0.5rem; }
    @keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.shimmer {
  background: linear-gradient(90deg,
    var(--pw-card-bg) 25%,
    rgba(255,255,255,0.08) 50%,
    var(--pw-card-bg) 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 12px;
}
.hero-skeleton { height: 280px; }
.skel-block { border-radius: 16px; margin: 1.5rem 0; }
.skel-plan { height: 90px; }
.skel-branding { height: 110px; }
.skel-qr { height: 220px; }
.skeleton-photo { aspect-ratio: 1; }
.skeleton-message { height: 60px; border: 1px solid var(--pw-card-border); }
.upgrade-picker { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
.upgrade-select {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; padding: 0.5rem 0.75rem; color: #F8F7FF; font-size: 0.85rem;
}
.pending-plan-note {
  background: rgba(244,114,182,0.12); border: 1px solid rgba(244,114,182,0.3);
  color: #F472B6; border-radius: 10px; padding: 0.7rem 1rem; font-size: 0.85rem;
}
 `]
})



export class EventDetailComponent implements OnInit, OnDestroy {
  private toast = inject(ToastService);
  private route       = inject(ActivatedRoute);
  private evSvc        = inject(EventsService);
  private photoSvc     = inject(PhotosService);
  private messagesSvc  = inject(MessagesService);
  private socketSvc    = inject(SocketService);
  private paymentsSvc = inject(PaymentsService);
private boldCheckout = inject(BoldCheckoutService);
cancelingPlan = signal(false);

processingPayment = signal(false);
  event   = signal<PhotoWallEvent | null>(null);
  photos  = signal<Photo[]>([]);
  loading = signal(true);
  copied  = signal(false);
  messages = signal<GuestMessage[]>([]);
  deletingMessageId = signal<string | null>(null);
  togglingMessages = signal(false);
  downloadingZip = signal(false);
brandingColor  = signal('#7C3AED');
savingBranding = signal(false);
brandingSaved  = signal(false);
notifications = signal<ActivityNotification[]>([]);
activityLog = signal<ActivityNotification[]>([]);
unreadCount = signal(0);
showActivityPanel = signal(false);
regeneratingQr = signal(false);
loadingPhotos = signal(true);      // 👈 nuevo
loadingMessages = signal(true);    // 👈 nuevo
skeletonPhotos = [0, 1, 2, 3, 4, 5];   // 👈 nuevo
skeletonMessages = [0, 1, 2];          // 👈 nuevo
plans = PLAN_CATALOG;
upgradeChoice: PlanType = PlanType.ESTANDAR;
requestingUpgrade = signal(false);
pendingPlanLabel = computed(() => {
  const p = this.event()?.pendingPlan;
  return p ? (PLAN_LABELS[p] ?? p) : '';
});


  guestUrl = () => `${window.location.origin}/e/${this.event()?.slug}`;
  planLabel = computed(() => PLAN_LABELS[this.event()?.plan!] ?? 'Gratis');
  photosUsagePercent = computed(() => {
    const u = this.event()?.usage;
    if (!u || u.maxPhotos === null) return 0;
    return Math.min(100, (u.currentPhotos / u.maxPhotos) * 100);
  });
  messagesUsagePercent = computed(() => {
    const u = this.event()?.usage;
    if (!u || u.maxMessages === null) return 0;
    return Math.min(100, (u.currentMessages / u.maxMessages) * 100);
  });


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.evSvc.getEventById(id).subscribe({
      next: (ev) => {
        this.event.set(ev);
        this.loading.set(false);
      this.photoSvc.getPhotosByEvent(ev._id).subscribe({
  next: (photos) => { this.photos.set(photos); this.loadingPhotos.set(false); },
  error: () => this.loadingPhotos.set(false)
});
this.messagesSvc.getMessagesByEvent(ev._id).subscribe({
  next: (msgs) => { this.messages.set(msgs); this.loadingMessages.set(false); },
  error: () => this.loadingMessages.set(false)
});
        this.socketSvc.joinEvent(ev._id);
        this.socketSvc.onNewMessage(msg => {
          this.messages.update(list => [
            { _id: msg._id, event: ev._id, authorName: msg.authorName, text: msg.text, createdAt: msg.createdAt },
            ...list
          ]);
          this.pushNotification('message', 'Nuevo mensaje', `${msg.authorName}: "${msg.text}"`);
        });
        this.socketSvc.onMessageDeleted(({ _id }) => {
          this.messages.update(list => list.filter(m => m._id !== _id));
        });
        this.socketSvc.onNewPhoto((photo: NewPhotoEvent) => {
          this.pushNotification(
            'photo',
            'Nueva foto',
            `${photo.uploadedBy} subió ${photo.type === 'video' ? 'un video' : 'una foto'}`
          );
        });
        this.socketSvc.onGuestJoined((guest: GuestJoinedEvent) => {
          this.pushNotification('guest', 'Nuevo invitado', `${guest.name} se unió al evento`);
        });
        this.brandingColor.set(ev.branding?.accentColor || '#7C3AED');

       if (ev.pendingPlan) {
  this.upgradeChoice = ev.pendingPlan;
} else if (ev.desiredPlan) {
  this.upgradeChoice = ev.desiredPlan;
}


      },
      error: () => this.loading.set(false)
    });
  }
  ngOnDestroy() {
    this.socketSvc.disconnect();
  }
  private pushNotification(type: ActivityNotification['type'], title: string, text: string) {
    const item: ActivityNotification = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type, title, text };
    this.notifications.update(list => [...list, item]);
    this.activityLog.update(list => [item, ...list].slice(0, MAX_ACTIVITY_LOG));
    if (!this.showActivityPanel()) {
      this.unreadCount.update(n => n + 1);
    }
    setTimeout(() => this.dismissNotification(item.id), TOAST_DURATION);
  }
  dismissNotification(id: string) {
    this.notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, leaving: true } : n))
    );
    setTimeout(() => {
      this.notifications.update(list => list.filter(n => n.id !== id));
    }, TOAST_LEAVE_ANIM);
  }
  toggleActivityPanel() {
    this.showActivityPanel.update(v => !v);
    if (this.showActivityPanel()) {
      this.unreadCount.set(0);
    }
  }
  clearActivity() {
    this.activityLog.set([]);
  }

  deletePhoto(id: string) {
  if (!confirm('¿Eliminar esta foto?')) return;
  this.photoSvc.deletePhoto(id).subscribe({
    next: () => this.photos.update(p => p.filter(ph => ph._id !== id)),
    error: () => this.toast.error('No se pudo eliminar la foto. Intenta de nuevo.')
  });
}

  deleteMessage(id: string) {
  if (!confirm('¿Eliminar este mensaje?')) return;
  this.deletingMessageId.set(id);
  this.messagesSvc.deleteMessage(id).subscribe({
    next: () => {
      this.messages.update(list => list.filter(m => m._id !== id));
      this.deletingMessageId.set(null);
    },
    error: () => {
      this.deletingMessageId.set(null);
      this.toast.error('No se pudo eliminar el mensaje. Intenta de nuevo.');
    }
  });
}
  toggleMessages() {
  const event = this.event();
  if (!event) return;
  this.togglingMessages.set(true);
  this.evSvc.toggleMessages(event._id, !event.messagesEnabled).subscribe({
    next: (res) => {
      this.event.update(e => e ? { ...e, messagesEnabled: res.event.messagesEnabled } : e);
      this.togglingMessages.set(false);
    },
    error: () => {
      this.togglingMessages.set(false);
      this.toast.error('No se pudo cambiar el estado de los mensajes.');
    }
  });
}
  downloadZip() {
  const event = this.event();
  if (!event) return;
  this.downloadingZip.set(true);
  this.photoSvc.downloadZip(event._id).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.slug}-fotos.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.downloadingZip.set(false);
    },
    error: () => {
      this.downloadingZip.set(false);
      this.toast.error('No se pudo preparar el álbum de fotos. Intenta de nuevo.');
    }
  });
}

  regenerateQr() {
  const event = this.event();
  if (!event) return;
  if (!confirm('¿Regenerar el QR de este evento? El código impreso o compartido actualmente dejará de funcionar.')) {
    return;
  }
  this.regeneratingQr.set(true);
  this.evSvc.regenerateQR(event._id).subscribe({
    next: (res) => {
      this.event.update(e => e ? { ...e, qrCode: res.event.qrCode } : e);
      this.regeneratingQr.set(false);
    },
    error: () => this.regeneratingQr.set(false)
  });
}

  onColorChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  this.brandingColor.set(value);
}

saveBranding() {
  const event = this.event();
  if (!event) return;
  this.savingBranding.set(true);
  this.evSvc.updateBranding(event._id, this.brandingColor()).subscribe({
    next: (res) => {
      this.event.update(e => e ? { ...e, branding: res.event.branding } : e);
      this.savingBranding.set(false);
      this.brandingSaved.set(true);
      setTimeout(() => this.brandingSaved.set(false), 2000);
    },
    error: () => {
      this.savingBranding.set(false);
      this.toast.error('No se pudo guardar el color. Intenta de nuevo.');
    }
  });
}

copyLink() {
  navigator.clipboard.writeText(this.guestUrl())
    .then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    })
    .catch(() => this.toast.error('No se pudo copiar el enlace.')); // 👈 nuevo
}

requestUpgrade() {
  const event = this.event();
  if (!event) return;
  this.requestingUpgrade.set(true);
  this.evSvc.requestPlanUpgrade(event._id, this.upgradeChoice).subscribe({
    next: (res) => {
      this.event.update(e => e ? { ...e, pendingPlan: res.event.pendingPlan } : e);
      this.requestingUpgrade.set(false);
    },
    error: () => this.requestingUpgrade.set(false)
  });
}

payWithBold() {
  const event = this.event();
  if (!event) return;
  this.processingPayment.set(true);
  this.paymentsSvc.createIntent(event._id, this.upgradeChoice).subscribe({
    next: (intent) => {
      this.processingPayment.set(false);
      const redirectionUrl = `${window.location.origin}/events/${event._id}/payment-result?orderId=${intent.orderId}`;
      this.boldCheckout.open(intent, redirectionUrl);
    },
    error: () => this.processingPayment.set(false)
  });
}

cancelPendingPlan() {
  const event = this.event();
  if (!event) return;
  this.cancelingPlan.set(true);
  this.evSvc.cancelPendingPlan(event._id).subscribe({
    next: (res) => {
      this.event.update(e => e ? { ...e, pendingPlan: res.event.pendingPlan } : e);
      this.cancelingPlan.set(false);
    },
    error: () => {
      this.cancelingPlan.set(false);
      this.toast.error('No se pudo cancelar la solicitud de pago.');
    }
  });
}

}
