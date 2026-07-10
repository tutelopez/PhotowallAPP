import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { EventsService } from '../../../../core/services/events';
import { PhotoWallEvent as Event } from '../../../../shared/models/Event.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="dashboard-page">
      <div class="dash-inner">
        <div class="dash-header">
          <div>
            <h1 class="dash-title">Mis eventos</h1>
            <p class="dash-sub">Hola, {{ auth.getCurrentUser()?.name }} 👋</p>
          </div>
          <a routerLink="/events/new" class="btn-pw-primary">+ Nuevo evento</a>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <div class="pw-spinner"></div>
          </div>
        } @else if (events().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📸</div>
            <h3>Aún no tienes eventos</h3>
            <p>Crea tu primer evento y comparte el QR con tus invitados</p>
            <a routerLink="/events/new" class="btn-pw-primary">Crear mi primer evento</a>
          </div>
        } @else {
          <div class="events-grid">
            @for (event of events(); track event._id) {
              <div class="event-card pw-card">
                <div class="event-type-badge">{{ event.type }}</div>
                <h3 class="event-name">{{ event.name }}</h3>
                <p class="event-date">
                  <i class="bi bi-calendar3"></i>
                  {{ event.date | date:'dd MMM yyyy' }}
                </p>
                <div class="event-stats">
                  <span><i class="bi bi-images"></i> {{ event.photoCount }} fotos</span>
                  <span class="status-dot" [class.active]="event.isActive">
                    {{ event.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="event-actions">
                  <a [routerLink]="'/events/' + event._id" class="btn-pw-ghost btn-sm">
                    Gestionar
                  </a>
                  <a [routerLink]="'/e/' + event.slug" target="_blank" class="btn-sm link-sm">
                    <i class="bi bi-box-arrow-up-right"></i> Ver galería
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 100vh;
      padding: 7rem 2rem 4rem;
      background: radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%),
                  var(--pw-ink);
    }
    .dash-inner { max-width: 960px; margin: 0 auto; }
    .dash-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 1rem; margin-bottom: 3rem;
    }
    .dash-title { font-size: 2rem; font-weight: 800; margin: 0; }
    .dash-sub { color: rgba(248,247,255,0.55); margin: 0.25rem 0 0; }

    .loading-state, .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 300px; text-align: center; gap: 1rem;
    }
    .empty-icon { font-size: 3rem; }
    .empty-state h3 { font-size: 1.3rem; margin: 0; }
    .empty-state p { color: rgba(248,247,255,0.55); margin: 0; }

    .events-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .event-card { display: flex; flex-direction: column; gap: 0.75rem; }
    .event-type-badge {
      display: inline-block; text-transform: capitalize;
      background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
      color: #A78BFA; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em;
      padding: 3px 10px; border-radius: 100px; width: fit-content;
    }
    .event-name { font-family: 'Syne', sans-serif; font-size: 1.15rem; font-weight: 700; margin: 0; }
    .event-date { color: rgba(248,247,255,0.5); font-size: 0.875rem; margin: 0; }
    .event-stats {
      display: flex; gap: 1rem; align-items: center;
      font-size: 0.8rem; color: rgba(248,247,255,0.5);
    }
    .status-dot {
      padding: 2px 8px; border-radius: 100px;
      background: rgba(226,75,74,0.15); color: #f09595;
      &.active { background: rgba(29,158,117,0.15); color: #5dcaa5; }
    }
    .event-actions { display: flex; gap: 0.75rem; align-items: center; margin-top: 0.5rem; }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
    .link-sm { color: rgba(248,247,255,0.5); font-size: 0.8rem; }
  `]
})
export class DashboardComponent implements OnInit {
  auth   = inject(AuthService);
  private eventsService = inject(EventsService);

  events  = signal<Event[]>([]);
  loading = signal(true);

 ngOnInit() {

  this.eventsService.getMyEvents().subscribe({

    next: (events) => {

      this.events.set(events);
      this.loading.set(false);

    },

    error: (err) => {

      console.error(err);
      this.loading.set(false);

    }

  });

}
}
