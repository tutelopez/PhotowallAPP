import { Component, AfterViewInit, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="hero__glow-top"></div>
      <div class="hero__glow-bottom"></div>

      <div class="hero__badge">
        <span class="badge-dot"></span>
        Galería en tiempo real · Proyección en vivo
      </div>

      <h1 class="hero__headline">
        Tus invitados suben fotos.<br>
        Tú las <span class="accent-violet">proyectas</span>
        en <span class="accent-rose">grande.</span>
      </h1>

      <p class="hero__sub">
        PhotoWall convierte cualquier evento en una experiencia visual compartida.
        Un QR, sin apps, sin registros — y las fotos fluyen solas en pantalla.
      </p>

      <div class="hero__actions">
        <a routerLink="/register" class="btn-pw-primary">Crear mi primer evento →</a>
        <a href="#como-funciona" class="btn-pw-ghost">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
               stroke="currentColor" stroke-width="2">
            <circle cx="7" cy="7" r="6"/><path d="M7 4v3l2 2"/>
          </svg>
          Ver cómo funciona
        </a>
      </div>

      <!-- LIVE PHOTO MOSAIC -->
      <div class="mosaic" #mosaic>
        @for (photo of photos; track photo.emoji; let i = $index) {
          <div class="photo-card" [class]="'c' + (i + 1)"
               [class.new-badge]="photo.isNew"
               [style.animation-delay]="(i * 0.15 + 0.1) + 's'">
            <div class="photo-emoji">{{ photo.emoji }}</div>
            <div class="photo-author">{{ photo.author }}</div>
          </div>
        }
      </div>
    </section>

    <!-- SOCIAL PROOF -->
    <div class="social-strip">
      <p class="social-title">Perfecto para todo tipo de celebración</p>
      <div class="events-row">
        @for (ev of eventTypes; track ev) {
          <div class="event-pill">
            <span class="event-dot"></span>{{ ev }}
          </div>
        }
      </div>
    </div>

    <!-- HOW IT WORKS -->
    <section class="steps-section" id="como-funciona">
      <div class="section-inner">
        <p class="section-label reveal">Flujo de uso</p>
        <h2 class="section-title reveal">Tres pasos y el evento cobra vida</h2>
        <p class="section-desc reveal">Sin instalaciones, sin cuentas para invitados. Solo escanear y disfrutar.</p>

        <div class="steps-grid reveal">
          @for (step of steps; track step.num) {
            <div class="step-card pw-card">
              <div class="step-num">{{ step.num }}</div>
              <div class="step-icon">{{ step.icon }}</div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-text">{{ step.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <div class="divider-line"></div>

    <!-- FEATURES -->
    <section class="features-section" id="funciones">
      <div class="section-inner">
        <p class="section-label reveal">Funciones</p>
        <h2 class="section-title reveal">Todo lo que necesitas para el momento perfecto</h2>
        <p class="section-desc reveal">Simplicidad para los invitados, control total para el organizador.</p>

        <div class="features-grid reveal">
          @for (feat of features; track feat.icon) {
            <div class="feature-card pw-card" [class.wide]="feat.wide">
              <div class="feat-icon">{{ feat.icon }}</div>
              <h4 class="feat-title">{{ feat.title }}</h4>
              <p class="feat-text">{{ feat.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section" id="empezar">
      <div class="cta-glow"></div>
      <div class="cta-inner">
        <h2 class="section-title reveal">Tu próximo evento merece<br>una pared de fotos en vivo</h2>
        <p class="section-desc reveal" style="max-width:100%">
          Crea tu evento gratis en menos de un minuto y deja que los recuerdos se construyan solos.
        </p>
        <div class="cta-actions reveal">
          <a routerLink="/register" class="btn-pw-primary">Comenzar gratis →</a>
          <a routerLink="/precios" class="btn-pw-ghost">Ver planes y precios →</a>
        </div>
        <p class="cta-note">Sin tarjeta de crédito · Listo en 60 segundos</p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="pw-footer">
      <div class="footer-logo">
        <span style="color:#F472B6">●</span> PhotoWall
      </div>
      <div class="footer-links">
        <a routerLink="/terminos">Términos</a>
        <a routerLink="/privacidad">Privacidad</a>
        <a href="mailto:thefilesystem1024@gmail.com">Contacto</a>
      </div>
      <div class="footer-social">
        <a href="#" target="_blank" title="Instagram" aria-label="Instagram">
          <i class="bi bi-instagram"></i>
        </a>
        <a href="#" target="_blank" title="Facebook" aria-label="Facebook">
          <i class="bi bi-facebook"></i>
        </a>
        <a href="mailto:thefilesystem1024@gmail.com" title="Correo" aria-label="Correo">
          <i class="bi bi-envelope"></i>
        </a>
      </div>
      <div class="footer-copy">© 2025 PhotoWall</div>
    </footer>
  `,
  styleUrl: './landing.scss'
})
export class LandingComponent implements OnInit, AfterViewInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  photos = [
    { emoji: '🥂', author: 'Ana García',  isNew: true },
    { emoji: '💃', author: 'Carlos M.',   isNew: false },
    { emoji: '🎂', author: 'Laura P.',    isNew: true },
    { emoji: '💍', author: 'Miguel R.',   isNew: false },
    { emoji: '🎉', author: 'Sofia K.',    isNew: false },
    { emoji: '📸', author: 'Juan T.',     isNew: true },
    { emoji: '🌹', author: 'María V.',    isNew: false },
    { emoji: '🎊', author: 'Pedro L.',    isNew: true },
  ];

  eventTypes = ['Bodas', 'Cumpleaños', 'Graduaciones', 'Eventos corporativos', 'Aniversarios', 'Fiestas'];

  steps = [
    {
      num: '01', icon: '🎉',
      title: 'Creas el evento',
      text: 'Registras el evento con nombre y fecha. Obtienes un QR único al instante, listo para imprimir o compartir.'
    },
    {
      num: '02', icon: '📲',
      title: 'Invitados escanean',
      text: 'Cualquier invitado escanea el QR desde su móvil. Ingresa su nombre y sube fotos — sin apps, sin contraseñas.'
    },
    {
      num: '03', icon: '🖥️',
      title: 'Proyectas en vivo',
      text: 'Abre la vista de proyección en tu pantalla grande. Las fotos aparecen automáticamente a medida que llegan.'
    },
  ];

  features = [
    {
      icon: '📷', wide: false,
      title: 'Subida desde cualquier dispositivo',
      text: 'iOS, Android, desktop — cualquier cámara funciona. Los invitados no instalan nada, solo abren el navegador.'
    },
    {
      icon: '⚡', wide: false,
      title: 'Galería en tiempo real',
      text: 'Las fotos aparecen en la galería en segundos. La proyección se actualiza sola, sin refrescar la página.'
    },
    {
      icon: '🔒', wide: false,
      title: 'Control total del organizador',
      text: 'Solo tú ves y administras tu evento. Puedes eliminar fotos inapropiadas antes de que lleguen a la pantalla.'
    },
    {
      icon: '🎨', wide: false,
      title: 'Vista de proyección dedicada',
      text: 'Una pantalla diseñada para verse espectacular en proyectores y pantallas grandes. Modo galería y slideshow.'
    },
    {
      icon: '🔗', wide: true,
      title: 'QR único por evento',
      text: 'Cada evento tiene su propio código QR. Imprímelo, ponlo en las mesas, compártelo por WhatsApp — tus invitados llegan al instante al álbum correcto. Nadie accede sin el QR.'
    },
  ];

  ngAfterViewInit() {
    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('revealed'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
}
