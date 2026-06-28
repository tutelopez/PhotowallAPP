import { Component, inject, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="pw-nav" [class.scrolled]="scrolled()">
      <div class="pw-nav__inner">
        <!-- Logo -->
        <a routerLink="/" class="pw-nav__logo">
          <span class="logo-dot"></span>
          PhotoWall
        </a>

        <!-- Desktop links -->
         <div class="pw-nav__links" *ngIf="!auth.isAuthenticated()">
          <a routerLink="/" fragment="como-funciona">Cómo funciona</a>
          <a routerLink="/" fragment="funciones">Funciones</a>
          <a routerLink="/login" class="btn-ghost-sm">Iniciar sesión</a>
          <a routerLink="/register" class="btn-primary-sm">Crear evento</a>
        </div>

        <!-- Authenticated links -->
         <div class="pw-nav__links" *ngIf="auth.isAuthenticated()">
          <a routerLink="/dashboard" routerLinkActive="active">Mis eventos</a>
          <a routerLink="/events/new" class="btn-primary-sm">+ Nuevo evento</a>
          <button class="btn-ghost-sm" (click)="auth.logout()">Salir</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .pw-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 1rem 2rem;
      transition: background 0.3s, border-color 0.3s;
      border-bottom: 1px solid transparent;
    }
    .pw-nav.scrolled {
      background: rgba(13,13,20,0.9);
      backdrop-filter: blur(12px);
      border-color: rgba(255,255,255,0.06);
    }
    .pw-nav__inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
    }
    .pw-nav__logo {
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 1.25rem;
      color: #F8F7FF; text-decoration: none;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .logo-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #F472B6;
      display: inline-block;
    }
    .pw-nav__links {
      display: flex; gap: 1.75rem; align-items: center;
      a, button {
        color: rgba(248,247,255,0.65); text-decoration: none;
        font-size: 0.875rem; font-weight: 500; background: none; border: none;
        cursor: pointer; transition: color 0.2s;
        &:hover, &.active { color: #F8F7FF; }
      }
    }
    .btn-primary-sm {
      background: #7C3AED !important; color: #F8F7FF !important;
      padding: 0.5rem 1.25rem; border-radius: 100px;
      font-weight: 600 !important;
      transition: background 0.2s !important;
      &:hover { background: #6D28D9 !important; }
    }
    .btn-ghost-sm {
      border: 1px solid rgba(255,255,255,0.15) !important;
      padding: 0.5rem 1.25rem; border-radius: 100px;
      &:hover { border-color: rgba(255,255,255,0.35) !important; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }
}
