import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, EventAdmin, OrganizerAdmin, PaymentAdmin, SystemStatsAdmin } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="sa-container">
      <!-- Top Bar -->
      <header class="sa-header">
        <div class="sa-header__left">
          <div class="sa-badge">👑 GLOBAL CONTROL</div>
          <h1 class="sa-title">Panel Central de SuperAdmin</h1>
          <p class="sa-subtitle">Monitoreo en tiempo real, ingresos, organizadores y gestión global</p>
        </div>
        <div class="sa-header__right">
          <button class="btn-refresh" (click)="loadAllData()" [disabled]="loading()">
            <i class="bi bi-arrow-clockwise" [class.spin]="loading()"></i>
            Sincronizar
          </button>
        </div>
      </header>

      <!-- Global Metrics Grid -->
      <section class="sa-metrics">
        <div class="metric-card revenue">
          <div class="metric-icon"><i class="bi bi-cash-stack"></i></div>
          <div class="metric-data">
            <span class="metric-label">Ingresos Totales (USD)</span>
            <span class="metric-value">{{ (stats()?.totalRevenue || 0) | currency:'USD':'symbol':'1.0-2' }}</span>
          </div>
        </div>

        <div class="metric-card organizers">
          <div class="metric-icon"><i class="bi bi-people-fill"></i></div>
          <div class="metric-data">
            <span class="metric-label">Organizadores</span>
            <span class="metric-value">{{ stats()?.totalOrganizers || organizers().length }}</span>
          </div>
        </div>

        <div class="metric-card events">
          <div class="metric-icon"><i class="bi bi-calendar-event-fill"></i></div>
          <div class="metric-data">
            <span class="metric-label">Eventos en Plataforma</span>
            <div class="metric-sub-flex">
              <span class="metric-value">{{ stats()?.totalEvents || events().length }}</span>
              <span class="pill-badge pill-premium">{{ stats()?.premiumEvents || premiumEventsCount() }} de Pago</span>
            </div>
          </div>
        </div>

        <div class="metric-card photos">
          <div class="metric-icon"><i class="bi bi-camera-fill"></i></div>
          <div class="metric-data">
            <span class="metric-label">Fotos Cargadas</span>
            <span class="metric-value">{{ stats()?.totalPhotos || 0 }}</span>
          </div>
        </div>

        <div class="metric-card messages">
          <div class="metric-icon"><i class="bi bi-chat-heart-fill"></i></div>
          <div class="metric-data">
            <span class="metric-label">Mensajes Enviados</span>
            <span class="metric-value">{{ stats()?.totalMessages || 0 }}</span>
          </div>
        </div>

        <div class="metric-card guests">
          <div class="metric-icon"><i class="bi bi-person-check-fill"></i></div>
          <div class="metric-data">
            <span class="metric-label">Invitados Registrados</span>
            <span class="metric-value">{{ stats()?.totalGuests || 0 }}</span>
          </div>
        </div>
      </section>

      <!-- Navigation Tabs -->
      <nav class="sa-tabs">
        <button
          class="sa-tab"
          [class.active]="activeTab() === 'events'"
          (click)="activeTab.set('events')"
        >
          <i class="bi bi-calendar2-check"></i>
          <span>Todos los Eventos</span>
          <span class="tab-count">{{ events().length }}</span>
        </button>

        <button
          class="sa-tab"
          [class.active]="activeTab() === 'organizers'"
          (click)="activeTab.set('organizers')"
        >
          <i class="bi bi-person-badge"></i>
          <span>Organizadores</span>
          <span class="tab-count">{{ organizers().length }}</span>
        </button>

        <button
          class="sa-tab"
          [class.active]="activeTab() === 'payments'"
          (click)="activeTab.set('payments')"
        >
          <i class="bi bi-credit-card-fill"></i>
          <span>Pagos Recibidos</span>
          <span class="tab-count">{{ payments().length }}</span>
        </button>

        <button
          class="sa-tab"
          [class.active]="activeTab() === 'system'"
          (click)="activeTab.set('system')"
        >
          <i class="bi bi-sliders"></i>
          <span>Mantenimiento & BD</span>
        </button>
      </nav>

      <!-- TAB 1: EVENTS -->
      @if (activeTab() === 'events') {
        <section class="sa-panel animate-fade">
          <div class="panel-header">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input
                type="text"
                [(ngModel)]="searchEventQuery"
                placeholder="Buscar por nombre, slug, organizador o email..."
              />
              @if (searchEventQuery) {
                <button class="btn-clear" (click)="searchEventQuery = ''"><i class="bi bi-x-circle-fill"></i></button>
              }
            </div>
            <span class="result-count">Mostrando {{ filteredEvents().length }} de {{ events().length }} eventos</span>
          </div>

          @if (loading()) {
            <div class="loading-state">
              <span class="pw-spinner-lg"></span>
              <p>Cargando eventos en tiempo real...</p>
            </div>
          } @else if (filteredEvents().length === 0) {
            <div class="empty-state">
              <i class="bi bi-calendar-x"></i>
              <p>No se encontraron eventos que coincidan con tu búsqueda.</p>
            </div>
          } @else {
            <div class="table-container">
              <table class="sa-table">
                <thead>
                  <tr>
                    <th>Evento / Enlace</th>
                    <th>Organizador</th>
                    <th>Fecha del Evento</th>
                    <th class="text-center">Contadores (Invitados / Fotos / Msjs)</th>
                    <th>Plan Actual</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (ev of filteredEvents(); track ev._id) {
                    <tr>
                      <td>
                        <div class="event-cell">
                          <strong>{{ ev.name }}</strong>
                          <a [routerLink]="['/e', ev.slug]" target="_blank" class="sub-slug">
                            /e/{{ ev.slug }} <i class="bi bi-box-arrow-up-right"></i>
                          </a>
                        </div>
                      </td>
                      <td>
                        <div class="org-cell">
                          @if (asOrganizer(ev.organizer); as orgObj) {
                            <span>{{ orgObj.name }}</span>
                            <small>{{ orgObj.email }}</small>
                          } @else {
                            <span>ID: {{ ev.organizer }}</span>
                          }
                        </div>
                      </td>
                      <td>
                        <div class="date-cell">
                          <span class="date-main">{{ ev.date | date:'mediumDate' }}</span>
                          <small class="date-sub">Creado: {{ (ev.createdAt | date:'shortDate') || 'N/A' }}</small>
                        </div>
                      </td>
                      <td class="text-center">
                        <div class="counters-row">
                          <span class="counter-badge guests" title="Invitados">
                            <i class="bi bi-person-fill"></i> {{ ev.stats?.guests || 0 }}
                          </span>
                          <span class="counter-badge photos" title="Fotos">
                            <i class="bi bi-image"></i> {{ ev.stats?.photos || 0 }}
                          </span>
                          <span class="counter-badge msgs" title="Mensajes">
                            <i class="bi bi-chat-left-text-fill"></i> {{ ev.stats?.messages || 0 }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <select
                          class="plan-select"
                          [ngModel]="ev.plan"
                          (ngModelChange)="changeEventPlan(ev._id, $event, ev.name)"
                          [disabled]="updatingPlanId() === ev._id"
                        >
                          <option value="free">Gratis (Free)</option>
                          <option value="esencial">Esencial ($29 USD)</option>
                          <option value="estandar">Estándar ($59 USD)</option>
                          <option value="premium">Premium ($99 USD)</option>
                        </select>
                      </td>
                      <td class="text-right">
                        <div class="btn-group">
                          <a [routerLink]="['/events', ev._id]" class="btn-icon" title="Ver detalle"><i class="bi bi-eye"></i></a>
                          <button class="btn-icon danger" (click)="deleteEvent(ev._id, ev.name)" title="Eliminar evento"><i class="bi bi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }

      <!-- TAB 2: ORGANIZERS -->
      @if (activeTab() === 'organizers') {
        <section class="sa-panel animate-fade">
          <div class="panel-header">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input
                type="text"
                [(ngModel)]="searchOrgQuery"
                placeholder="Buscar organizador por nombre o email..."
              />
              @if (searchOrgQuery) {
                <button class="btn-clear" (click)="searchOrgQuery = ''"><i class="bi bi-x-circle-fill"></i></button>
              }
            </div>
            <span class="result-count">Mostrando {{ filteredOrganizers().length }} de {{ organizers().length }} organizadores</span>
          </div>

          @if (loading()) {
            <div class="loading-state">
              <span class="pw-spinner-lg"></span>
              <p>Cargando organizadores...</p>
            </div>
          } @else if (filteredOrganizers().length === 0) {
            <div class="empty-state">
              <i class="bi bi-person-x"></i>
              <p>No se encontraron organizadores con esos datos.</p>
            </div>
          } @else {
            <div class="table-container">
              <table class="sa-table">
                <thead>
                  <tr>
                    <th>Organizador</th>
                    <th>Correo electrónico</th>
                    <th>Fecha de Registro</th>
                    <th class="text-center">Eventos Creados</th>
                    <th>Rol en Sistema</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (org of filteredOrganizers(); track org._id) {
                    <tr>
                      <td>
                        <div class="org-user-cell">
                          <div class="mini-avatar">{{ org.name[0] | uppercase }}</div>
                          <strong>{{ org.name }}</strong>
                        </div>
                      </td>
                      <td><span class="email-text">{{ org.email }}</span></td>
                      <td>
                        <span class="date-main">{{ (org.createdAt | date:'mediumDate') || 'N/A' }}</span>
                      </td>
                      <td class="text-center">
                        <div class="org-events-stats">
                          <span class="count-pill total" title="Total Eventos">
                            <i class="bi bi-calendar"></i> {{ org.eventsCount || 0 }} totales
                          </span>
                          @if ((org.premiumEventsCount || 0) > 0) {
                            <span class="count-pill premium" title="Eventos de Pago">
                              <i class="bi bi-star-fill"></i> {{ org.premiumEventsCount }} pago
                            </span>
                          }
                        </div>
                      </td>
                      <td><span class="role-pill">{{ org.role }}</span></td>
                      <td class="text-right">
                        <div class="btn-group">
                          <button class="btn-sm btn-pw-ghost" (click)="openOrgEventsModal(org)">
                            <i class="bi bi-list-check"></i> Ver eventos
                          </button>
                          <button class="btn-sm btn-danger-ghost" (click)="deleteOrganizer(org._id, org.name)" title="Eliminar cuenta">
                            <i class="bi bi-person-x-fill"></i> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }

      <!-- TAB 3: PAYMENTS -->
      @if (activeTab() === 'payments') {
        <section class="sa-panel animate-fade">
          <div class="panel-header">
            <h3 class="panel-title"><i class="bi bi-receipt"></i> Registro de Transacciones de Pago</h3>
            <span class="result-count">Total Registros: {{ payments().length }}</span>
          </div>

          @if (loading()) {
            <div class="loading-state">
              <span class="pw-spinner-lg"></span>
              <p>Cargando historial financiero...</p>
            </div>
          } @else if (payments().length === 0) {
            <div class="empty-state">
              <i class="bi bi-wallet2"></i>
              <p>Aún no se han registrado transacciones de pago en la plataforma.</p>
            </div>
          } @else {
            <div class="table-container">
              <table class="sa-table">
                <thead>
                  <tr>
                    <th>Orden ID / Proveedor</th>
                    <th>Organizador</th>
                    <th>Evento Destino</th>
                    <th>Plan Adquirido</th>
                    <th>Monto USD</th>
                    <th>Estado</th>
                    <th>Fecha de Transacción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (pay of payments(); track pay._id) {
                    <tr>
                      <td>
                        <div class="order-cell">
                          <strong class="order-id">{{ pay.orderId }}</strong>
                          <span class="provider-badge">{{ pay.provider | uppercase }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="org-cell">
                          @if (pay.organizer) {
                            <span>{{ pay.organizer.name }}</span>
                            <small>{{ pay.organizer.email }}</small>
                          } @else {
                            <span>N/A</span>
                          }
                        </div>
                      </td>
                      <td>
                        @if (pay.event) {
                          <a [routerLink]="['/events', pay.event._id]" class="event-link">
                            {{ pay.event.name }}
                          </a>
                        } @else {
                          <span>Evento eliminado</span>
                        }
                      </td>
                      <td><span class="plan-badge {{ pay.plan }}">{{ pay.plan | uppercase }}</span></td>
                      <td><strong class="amount-val">{{ pay.amount | currency:'USD':'symbol':'1.2-2' }}</strong></td>
                      <td>
                        <span class="status-badge" [class.approved]="pay.status === 'approved'" [class.pending]="pay.status === 'pending'">
                          {{ pay.status | uppercase }}
                        </span>
                      </td>
                      <td>{{ (pay.createdAt | date:'medium') || 'N/A' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }

      <!-- TAB 4: SYSTEM & DB -->
      @if (activeTab() === 'system') {
        <section class="sa-panel animate-fade system-grid">
          <!-- Seed Card -->
          <div class="system-card seed">
            <div class="system-icon"><i class="bi bi-database-fill-up"></i></div>
            <div class="system-content">
              <h3>Poblar Base de Datos (Seed)</h3>
              <p>Crea automáticamente organizadores de prueba, eventos con fotos, invitados y mensajes para validar el funcionamiento del sistema en segundos.</p>
              <button class="btn-pw-primary" (click)="seedDatabase()" [disabled]="actionLoading()">
                @if (actionLoading()) { <span class="pw-spinner-sm"></span> Ejecutando... } @else { <i class="bi bi-magic"></i> Ejecutar Seeder }
              </button>
            </div>
          </div>

          <!-- Clear Events Card -->
          <div class="system-card warn">
            <div class="system-icon"><i class="bi bi-calendar-x-fill"></i></div>
            <div class="system-content">
              <h3>Limpiar Todos los Eventos</h3>
              <p>Elimina permanentemente todos los eventos, fotos, galerías e invitados de la base de datos. Los organizadores mantendrán sus cuentas activas sin eventos.</p>
              <button class="btn-danger-ghost" (click)="deleteAllEvents()" [disabled]="actionLoading()">
                <i class="bi bi-trash3-fill"></i> Eliminar Eventos (Mantener Usuarios)
              </button>
            </div>
          </div>

          <!-- Factory Reset Card -->
          <div class="system-card danger">
            <div class="system-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <div class="system-content">
              <h3>Reiniciar Plataforma (Factory Reset)</h3>
              <p><strong>ATENCIÓN DESTRUCTIVA:</strong> Esto borrará todos los eventos, organizadores, invitados y archivos de Cloudinary. Solo permanecerán intactas las cuentas con rol SuperAdmin.</p>
              
              <div class="confirm-box">
                <input
                  type="text"
                  [(ngModel)]="resetConfirmText"
                  placeholder="Escribe YES_RESET_ALL para confirmar"
                />
                <button
                  class="btn-danger-solid"
                  (click)="resetAllData()"
                  [disabled]="actionLoading() || resetConfirmText !== 'YES_RESET_ALL'"
                >
                  <i class="bi bi-shield-slash-fill"></i> Resetear Plataforma
                </button>
              </div>
            </div>
          </div>
        </section>
      }
    </div>

    <!-- MODAL: ORGANIZER EVENTS -->
    @if (selectedOrgForEvents()) {
      <div class="modal-backdrop animate-fade" (click)="closeOrgEventsModal()">
        <div class="modal-card animate-scale" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <div>
              <h3>Eventos de: {{ selectedOrgForEvents()?.name }}</h3>
              <p>{{ selectedOrgForEvents()?.email }}</p>
            </div>
            <button class="btn-icon" (click)="closeOrgEventsModal()"><i class="bi bi-x-lg"></i></button>
          </header>

          <div class="modal-body">
            @if (orgEventsLoading()) {
              <div class="loading-state">
                <span class="pw-spinner-md"></span>
                <p>Consultando eventos...</p>
              </div>
            } @else if (selectedOrgEvents().length === 0) {
              <div class="empty-state py-8">
                <i class="bi bi-calendar-x"></i>
                <p>Este organizador aún no ha creado ningún evento.</p>
              </div>
            } @else {
              <table class="sa-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Plan</th>
                    <th>Contadores</th>
                    <th class="text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (ev of selectedOrgEvents(); track ev._id) {
                    <tr>
                      <td><strong>{{ ev.name }}</strong></td>
                      <td>{{ ev.date | date:'shortDate' }}</td>
                      <td><span class="plan-badge {{ ev.plan }}">{{ ev.plan | uppercase }}</span></td>
                      <td>
                        <span class="counter-badge guests"><i class="bi bi-person"></i> {{ ev.stats?.guests || 0 }}</span>
                        <span class="counter-badge photos"><i class="bi bi-image"></i> {{ ev.stats?.photos || 0 }}</span>
                      </td>
                      <td class="text-right">
                        <a [routerLink]="['/events', ev._id]" class="btn-sm btn-pw-ghost" (click)="closeOrgEventsModal()">Ver</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .sa-container {
      max-width: 1350px;
      margin: 0 auto;
      padding: 2.5rem 2rem 5rem;
      color: #F8F7FF;
      font-family: 'Inter', sans-serif;
    }

    /* TOP HEADER */
    .sa-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1.5rem;
    }
    .sa-badge {
      display: inline-block;
      background: linear-gradient(135deg, #EC4899, #8B5CF6);
      color: #FFF;
      font-weight: 800;
      font-size: 0.75rem;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      letter-spacing: 0.5px;
      margin-bottom: 0.6rem;
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
    }
    .sa-title {
      font-family: 'Syne', sans-serif;
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0 0 0.4rem 0;
      background: linear-gradient(90deg, #FFFFFF, #E2E8F0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .sa-subtitle {
      color: rgba(248, 247, 255, 0.6);
      font-size: 0.95rem;
      margin: 0;
    }
    .btn-refresh {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #FFF;
      padding: 0.7rem 1.25rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-refresh:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* METRICS GRID */
    .sa-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    .metric-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 1.4rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      backdrop-filter: blur(10px);
      transition: transform 0.2s, border-color 0.2s;
    }
    .metric-card:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 255, 255, 0.18);
    }
    .metric-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }
    .revenue .metric-icon { background: rgba(16, 185, 129, 0.15); color: #10B981; }
    .organizers .metric-icon { background: rgba(139, 92, 246, 0.15); color: #A78BFA; }
    .events .metric-icon { background: rgba(236, 72, 153, 0.15); color: #F472B6; }
    .photos .metric-icon { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
    .messages .metric-icon { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }
    .guests .metric-icon { background: rgba(236, 72, 153, 0.15); color: #EC4899; }

    .metric-data {
      display: flex;
      flex-direction: column;
    }
    .metric-label {
      font-size: 0.8rem;
      color: rgba(248, 247, 255, 0.55);
      font-weight: 500;
      margin-bottom: 0.2rem;
    }
    .metric-value {
      font-size: 1.65rem;
      font-weight: 800;
      color: #FFF;
      font-family: 'Syne', sans-serif;
    }
    .metric-sub-flex { display: flex; align-items: center; gap: 0.6rem; }
    .pill-badge {
      font-size: 0.7rem;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-weight: 700;
    }
    .pill-premium { background: rgba(236, 72, 153, 0.2); color: #F472B6; }

    /* TABS */
    .sa-tabs {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1rem;
      overflow-x: auto;
    }
    .sa-tab {
      background: transparent;
      border: none;
      color: rgba(248, 247, 255, 0.6);
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      transition: all 0.2s;
    }
    .sa-tab:hover {
      color: #FFF;
      background: rgba(255, 255, 255, 0.04);
    }
    .sa-tab.active {
      background: rgba(139, 92, 246, 0.2);
      color: #A78BFA;
      border: 1px solid rgba(139, 92, 246, 0.4);
    }
    .tab-count {
      background: rgba(255, 255, 255, 0.1);
      color: #FFF;
      font-size: 0.75rem;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
    }

    /* PANELS & TABLES */
    .sa-panel {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.75rem;
      backdrop-filter: blur(12px);
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .panel-title { font-size: 1.25rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
    .search-box {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0.5rem 1rem;
      width: 100%;
      max-width: 450px;
      gap: 0.6rem;
    }
    .search-box i { color: rgba(255, 255, 255, 0.4); }
    .search-box input {
      background: transparent;
      border: none;
      color: #FFF;
      width: 100%;
      outline: none;
      font-size: 0.95rem;
    }
    .btn-clear { background: transparent; border: none; color: rgba(255,255,255,0.4); cursor: pointer; }
    .result-count { font-size: 0.85rem; color: rgba(248, 247, 255, 0.5); font-weight: 500; }

    .table-container { overflow-x: auto; }
    .sa-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .sa-table th {
      text-align: left;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(248, 247, 255, 0.55);
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sa-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }
    .sa-table tr:hover { background: rgba(255, 255, 255, 0.02); }

    /* CELL STYLES */
    .event-cell, .org-cell, .date-cell, .order-cell { display: flex; flex-direction: column; gap: 0.2rem; }
    .sub-slug, .event-link { color: #A78BFA; font-size: 0.8rem; text-decoration: none; }
    .sub-slug:hover, .event-link:hover { text-decoration: underline; }
    .date-main { font-weight: 500; color: #FFF; }
    .date-sub { color: rgba(248, 247, 255, 0.45); font-size: 0.78rem; }

    .org-user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .mini-avatar {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1rem; color: #FFF;
    }
    .email-text { color: rgba(248, 247, 255, 0.8); }

    .counters-row { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
    .counter-badge {
      display: inline-flex; align-items: center; gap: 0.35rem;
      background: rgba(255, 255, 255, 0.06);
      padding: 0.25rem 0.6rem; border-radius: 8px;
      font-size: 0.8rem; font-weight: 600; color: #E2E8F0;
    }
    .counter-badge.guests { border-left: 3px solid #EC4899; }
    .counter-badge.photos { border-left: 3px solid #60A5FA; }
    .counter-badge.msgs { border-left: 3px solid #FBBF24; }

    .org-events-stats { display: flex; gap: 0.4rem; justify-content: center; }
    .count-pill {
      font-size: 0.78rem; padding: 0.25rem 0.6rem; border-radius: 8px; font-weight: 700;
      display: inline-flex; align-items: center; gap: 0.3rem;
    }
    .count-pill.total { background: rgba(139, 92, 246, 0.15); color: #A78BFA; }
    .count-pill.premium { background: rgba(16, 185, 129, 0.15); color: #10B981; }

    .role-pill {
      background: rgba(255, 255, 255, 0.08); color: #FFF;
      padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase;
    }
    .provider-badge { font-size: 0.7rem; background: rgba(59, 130, 246, 0.2); color: #60A5FA; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 800; }
    .order-id { font-family: monospace; font-size: 0.85rem; }
    .plan-badge { font-size: 0.75rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 6px; }
    .plan-badge.free { background: rgba(255,255,255,0.1); color: #FFF; }
    .plan-badge.esencial { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
    .plan-badge.estandar { background: rgba(139, 92, 246, 0.2); color: #A78BFA; }
    .plan-badge.premium { background: rgba(236, 72, 153, 0.2); color: #F472B6; }
    .amount-val { color: #10B981; font-size: 1.05rem; }
    .status-badge { font-size: 0.75rem; font-weight: 800; padding: 0.25rem 0.65rem; border-radius: 999px; }
    .status-badge.approved { background: rgba(16, 185, 129, 0.2); color: #10B981; }
    .status-badge.pending { background: rgba(245, 158, 11, 0.2); color: #FBBF24; }

    .plan-select {
      background: #1E1E2E; border: 1px solid rgba(255, 255, 255, 0.15);
      color: #FFF; padding: 0.45rem 0.75rem; border-radius: 8px; font-size: 0.85rem;
      cursor: pointer; outline: none; transition: border-color 0.2s;
    }
    .plan-select:focus { border-color: #8B5CF6; }

    /* BUTTONS */
    .btn-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .btn-icon {
      background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
      color: #FFF; width: 34px; height: 34px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
    }
    .btn-icon:hover { background: rgba(255, 255, 255, 0.12); }
    .btn-icon.danger:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #EF4444; }

    .btn-sm {
      padding: 0.45rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
      cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 0.35rem; transition: all 0.2s;
    }
    .btn-pw-ghost { background: rgba(255, 255, 255, 0.08); color: #FFF; }
    .btn-pw-ghost:hover { background: rgba(255, 255, 255, 0.15); }
    .btn-danger-ghost { background: rgba(239, 68, 68, 0.12); color: #EF4444; }
    .btn-danger-ghost:hover { background: rgba(239, 68, 68, 0.25); }

    /* SYSTEM TAB */
    .system-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .system-card {
      background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px; padding: 1.75rem; display: flex; flex-direction: column; gap: 1rem;
    }
    .system-card.seed { border-color: rgba(139, 92, 246, 0.3); }
    .system-card.warn { border-color: rgba(245, 158, 11, 0.3); }
    .system-card.danger { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.04); }
    .system-icon { font-size: 2.2rem; }
    .seed .system-icon { color: #A78BFA; }
    .warn .system-icon { color: #FBBF24; }
    .danger .system-icon { color: #EF4444; }
    .system-content h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem 0; }
    .system-content p { color: rgba(248, 247, 255, 0.65); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem; }
    
    .confirm-box { display: flex; flex-direction: column; gap: 0.75rem; }
    .confirm-box input {
      background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(239, 68, 68, 0.4);
      color: #FFF; padding: 0.6rem 1rem; border-radius: 10px; outline: none;
    }
    .btn-danger-solid {
      background: #EF4444; color: #FFF; font-weight: 700; padding: 0.75rem 1.25rem;
      border-radius: 10px; border: none; cursor: pointer; transition: background 0.2s;
    }
    .btn-danger-solid:hover:not(:disabled) { background: #DC2626; }
    .btn-danger-solid:disabled { opacity: 0.5; cursor: not-allowed; }

    /* STATES & MODALS */
    .loading-state, .empty-state { text-align: center; padding: 3.5rem 1rem; color: rgba(248, 247, 255, 0.6); }
    .loading-state p, .empty-state p { margin-top: 1rem; font-size: 0.95rem; }
    .empty-state i { font-size: 3rem; color: rgba(255, 255, 255, 0.2); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }

    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
      z-index: 999; display: flex; align-items: center; justify-content: center; padding: 1.5rem;
    }
    .modal-card {
      background: #181824; border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px; width: 100%; max-width: 650px; max-height: 85vh;
      display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .modal-header {
      padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { margin: 0; font-size: 1.25rem; }
    .modal-header p { margin: 0.2rem 0 0 0; color: rgba(248, 247, 255, 0.6); font-size: 0.85rem; }
    .modal-body { padding: 1.5rem; overflow-y: auto; }

    .animate-fade { animation: fadeIn 0.3s ease; }
    .animate-scale { animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class SuperAdminComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private toast = inject(ToastService);

  activeTab = signal<'events' | 'organizers' | 'payments' | 'system'>('events');

  events = signal<EventAdmin[]>([]);
  organizers = signal<OrganizerAdmin[]>([]);
  payments = signal<PaymentAdmin[]>([]);
  stats = signal<SystemStatsAdmin | null>(null);

  loading = signal<boolean>(false);
  actionLoading = signal<boolean>(false);
  updatingPlanId = signal<string | null>(null);

  searchEventQuery = '';
  searchOrgQuery = '';
  resetConfirmText = '';

  premiumEventsCount = signal(0);

  // Modal State for Organizer Events
  selectedOrgForEvents = signal<OrganizerAdmin | null>(null);
  selectedOrgEvents = signal<EventAdmin[]>([]);
  orgEventsLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadAllData();
  }

  asOrganizer(org: any): { _id: string; name: string; email: string; role?: string } | null {
    if (org && typeof org === 'object' && 'name' in org) {
      return org;
    }
    return null;
  }

  loadAllData() {
    this.loading.set(true);
    this.adminSvc.getSystemStats().subscribe({
      next: (st) => this.stats.set(st),
      error: () => console.error('Error al cargar stats')
    });

    this.adminSvc.getAllPayments().subscribe({
      next: (res) => this.payments.set(res.payments || []),
      error: () => console.error('Error al cargar pagos')
    });

    this.adminSvc.getOrganizers().subscribe({
      next: (res) => {
        this.organizers.set(res.organizers || []);
        this.adminSvc.getAllEvents().subscribe({
          next: (evRes) => {
            const list = evRes.events || [];
            this.events.set(list);
            this.premiumEventsCount.set(list.filter(e => e.plan !== 'free').length);
            this.loading.set(false);
          },
          error: () => {
            this.toast.error('No se pudieron cargar los eventos globales.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.toast.error('No se pudieron cargar los organizadores.');
        this.loading.set(false);
      }
    });
  }

  filteredEvents() {
    const query = this.searchEventQuery.trim().toLowerCase();
    if (!query) return this.events();
    return this.events().filter(e => {
      const name = (e.name || '').toLowerCase();
      const slug = (e.slug || '').toLowerCase();
      const orgObj = this.asOrganizer(e.organizer);
      const orgName = (orgObj?.name || '').toLowerCase();
      const orgEmail = (orgObj?.email || '').toLowerCase();
      return name.includes(query) || slug.includes(query) || orgName.includes(query) || orgEmail.includes(query);
    });
  }

  filteredOrganizers() {
    const query = this.searchOrgQuery.trim().toLowerCase();
    if (!query) return this.organizers();
    return this.organizers().filter(o => {
      const name = (o.name || '').toLowerCase();
      const email = (o.email || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }

  openOrgEventsModal(org: OrganizerAdmin) {
    this.selectedOrgForEvents.set(org);
    this.orgEventsLoading.set(true);
    this.selectedOrgEvents.set([]);
    this.adminSvc.getEventsByOrganizer(org._id).subscribe({
      next: (res) => {
        this.selectedOrgEvents.set(res.events || []);
        this.orgEventsLoading.set(false);
      },
      error: () => {
        this.toast.error('Error al obtener eventos de este organizador');
        this.orgEventsLoading.set(false);
      }
    });
  }

  closeOrgEventsModal() {
    this.selectedOrgForEvents.set(null);
    this.selectedOrgEvents.set([]);
  }

  changeEventPlan(eventId: string, newPlan: string, eventName: string) {
    this.updatingPlanId.set(eventId);
    this.adminSvc.setEventPlan(eventId, newPlan).subscribe({
      next: () => {
        this.toast.success(`Plan de "${eventName}" cambiado a ${newPlan.toUpperCase()}`);
        this.events.update(list => list.map(e => e._id === eventId ? { ...e, plan: newPlan as any } : e));
        this.premiumEventsCount.set(this.events().filter(e => e.plan !== 'free').length);
        this.updatingPlanId.set(null);
      },
      error: () => {
        this.toast.error('No se pudo actualizar el plan del evento');
        this.updatingPlanId.set(null);
      }
    });
  }

  deleteEvent(eventId: string, eventName: string) {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el evento "${eventName}"? Se borrarán todas sus fotos e invitados.`)) {
      return;
    }
    this.adminSvc.deleteEventById(eventId).subscribe({
      next: () => {
        this.toast.success('Evento eliminado correctamente');
        this.events.update(list => list.filter(e => e._id !== eventId));
        this.premiumEventsCount.set(this.events().filter(e => e.plan !== 'free').length);
      },
      error: () => this.toast.error('Error al eliminar el evento')
    });
  }

  deleteOrganizer(organizerId: string, organizerName: string) {
    if (!confirm(`🚨 ¿ELIMINAR ORGANIZADOR "${organizerName}"?\nSe eliminarán su cuenta y TODOS LOS EVENTOS vinculados a él.`)) {
      return;
    }
    this.adminSvc.deleteOrganizer(organizerId).subscribe({
      next: () => {
        this.toast.success('Organizador y sus eventos eliminados correctamente');
        this.organizers.update(list => list.filter(o => o._id !== organizerId));
        this.events.update(list => {
          return list.filter(e => {
            const orgObj = this.asOrganizer(e.organizer);
            return (orgObj?._id || e.organizer) !== organizerId;
          });
        });
      },
      error: () => this.toast.error('Error al eliminar al organizador')
    });
  }

  seedDatabase() {
    this.actionLoading.set(true);
    this.adminSvc.seedDatabase().subscribe({
      next: () => {
        this.toast.success('¡Base de datos poblada con éxito con datos de prueba!');
        this.actionLoading.set(false);
        this.loadAllData();
      },
      error: () => {
        this.toast.error('Hubo un error al ejecutar el seeder.');
        this.actionLoading.set(false);
      }
    });
  }

  deleteAllEvents() {
    if (!confirm('⚠️ ¿Estás seguro de eliminar TODOS los eventos, fotos e invitados de la base de datos? (Las cuentas de los organizadores se conservarán).')) {
      return;
    }
    this.actionLoading.set(true);
    this.adminSvc.deleteAllEvents().subscribe({
      next: () => {
        this.toast.success('Todos los eventos han sido eliminados de la plataforma.');
        this.actionLoading.set(false);
        this.loadAllData();
      },
      error: () => {
        this.toast.error('Error al intentar eliminar todos los eventos.');
        this.actionLoading.set(false);
      }
    });
  }

  resetAllData() {
    if (this.resetConfirmText !== 'YES_RESET_ALL') {
      this.toast.error('Debes escribir YES_RESET_ALL exactamente para confirmar.');
      return;
    }
    if (!confirm('🚨 ÚLTIMA ADVERTENCIA: Se borrará toda la información (organizadores, eventos, fotos en Cloudinary) excepto SuperAdmin. ¿Proceder?')) {
      return;
    }
    this.actionLoading.set(true);
    this.adminSvc.resetAllData().subscribe({
      next: () => {
        this.toast.success('Plataforma reiniciada por completo.');
        this.resetConfirmText = '';
        this.actionLoading.set(false);
        this.loadAllData();
      },
      error: () => {
        this.toast.error('Error durante el reinicio de la base de datos.');
        this.actionLoading.set(false);
      }
    });
  }
}
