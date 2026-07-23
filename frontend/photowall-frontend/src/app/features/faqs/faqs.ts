import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FaqItem {
  id: number;
  category: 'general' | 'planes' | 'proyeccion' | 'seguridad';
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="faqs-page">
      <div class="faqs-header">
        <a routerLink="/" class="back-link">
          <i class="bi bi-arrow-left"></i> Volver al inicio
        </a>
        <div class="header-badge">✨ Centro de Ayuda</div>
        <h1>Preguntas Frecuentes</h1>
        <p>Todo lo que necesitas saber para capturar y proyectar recuerdos inolvidables en tus eventos con PhotoWall.</p>
        
        <div class="category-filters">
          <button class="filter-btn" [class.active]="selectedCategory() === 'all'" (click)="setCategory('all')">
            🌟 Todas ({{ faqs.length }})
          </button>
          <button class="filter-btn" [class.active]="selectedCategory() === 'general'" (click)="setCategory('general')">
            📸 General
          </button>
          <button class="filter-btn" [class.active]="selectedCategory() === 'planes'" (click)="setCategory('planes')">
            💳 Planes y Pagos
          </button>
          <button class="filter-btn" [class.active]="selectedCategory() === 'proyeccion'" (click)="setCategory('proyeccion')">
            🖥️ Proyección y Moderación
          </button>
          <button class="filter-btn" [class.active]="selectedCategory() === 'seguridad'" (click)="setCategory('seguridad')">
            🔒 Seguridad y Soporte
          </button>
        </div>
      </div>

      <div class="faqs-container">
        @for (item of filteredFaqs(); track item.id) {
          <div class="faq-card" [class.faq-card--open]="item.isOpen" (click)="toggleItem(item.id)">
            <div class="faq-question">
              <span class="q-badge">{{ getCategoryLabel(item.category) }}</span>
              <h3>{{ item.question }}</h3>
              <div class="toggle-icon">
                <i class="bi" [class.bi-plus-lg]="!item.isOpen" [class.bi-dash-lg]="item.isOpen"></i>
              </div>
            </div>
            @if (item.isOpen) {
              <div class="faq-answer">
                <p>{{ item.answer }}</p>
              </div>
            }
          </div>
        }
      </div>

      <div class="faqs-footer-cta">
        <div class="cta-card">
          <h2>¿Aún tienes dudas sobre cómo empezar?</h2>
          <p>Crea tu primer evento totalmente gratis o escríbenos directamente. Estamos para ayudarte.</p>
          <div class="cta-actions">
            <a routerLink="/events/new" class="btn-pw-primary">Crear evento gratis</a>
            <a routerLink="/precios" class="btn-pw-ghost">Ver precios</a>
            <a href="mailto:hola.photowall@gmail.com" class="btn-pw-ghost">
              <i class="bi bi-envelope-fill"></i> Contactar soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .faqs-page {
      min-height: 100vh;
      padding: 6rem 2rem 6rem;
      background: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 60%), var(--pw-ink);
      color: var(--pw-cream);
    }
    .faqs-header {
      max-width: 800px;
      margin: 0 auto 3.5rem;
      text-align: center;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: rgba(248, 247, 255, 0.55);
      font-size: 0.875rem;
      margin-bottom: 2rem;
      transition: color 0.2s;
      text-decoration: none;
    }
    .back-link:hover {
      color: var(--pw-violet-light);
    }
    .header-badge {
      display: inline-block;
      background: rgba(124, 58, 237, 0.2);
      border: 1px solid rgba(124, 58, 237, 0.4);
      color: var(--pw-violet-light);
      padding: 0.35rem 1rem;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .faqs-header h1 {
      font-family: 'Syne', sans-serif;
      font-size: 2.75rem;
      font-weight: 800;
      margin: 0 0 1rem;
      background: linear-gradient(135deg, #FFF 0%, #C4B5FD 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .faqs-header p {
      color: rgba(248, 247, 255, 0.65);
      font-size: 1.1rem;
      line-height: 1.6;
      max-width: 620px;
      margin: 0 auto 2.5rem;
    }
    .category-filters {
      display: flex;
      gap: 0.6rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .filter-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(248, 247, 255, 0.7);
      padding: 0.55rem 1.1rem;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .filter-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
      color: #FFF;
      transform: translateY(-2px);
    }
    .filter-btn.active {
      background: var(--pw-violet);
      border-color: var(--pw-violet-light);
      color: #FFF;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
    }
    .faqs-container {
      max-width: 820px;
      margin: 0 auto 5rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .faq-card {
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 18px;
      padding: 1.4rem 1.75rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .faq-card:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(124, 58, 237, 0.35);
      transform: translateY(-2px);
    }
    .faq-card--open {
      background: rgba(124, 58, 237, 0.08);
      border-color: rgba(124, 58, 237, 0.5);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .faq-question {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: space-between;
    }
    .q-badge {
      background: rgba(255, 255, 255, 0.08);
      color: #C4B5FD;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      flex-shrink: 0;
    }
    .faq-question h3 {
      flex: 1;
      font-family: 'Syne', sans-serif;
      font-size: 1.12rem;
      font-weight: 700;
      margin: 0;
      color: #FFF;
      line-height: 1.4;
    }
    .toggle-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--pw-violet-light);
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    .faq-card--open .toggle-icon {
      background: var(--pw-violet);
      color: #FFF;
      transform: rotate(180deg);
    }
    .faq-answer {
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      animation: fadeIn 0.3s ease;
    }
    .faq-answer p {
      color: rgba(248, 247, 255, 0.8);
      font-size: 0.98rem;
      line-height: 1.7;
      margin: 0;
    }
    .faqs-footer-cta {
      max-width: 820px;
      margin: 0 auto;
    }
    .cta-card {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(244, 114, 182, 0.1) 100%);
      border: 1px solid rgba(124, 58, 237, 0.4);
      border-radius: 24px;
      padding: 3rem 2rem;
      text-align: center;
    }
    .cta-card h2 {
      font-family: 'Syne', sans-serif;
      font-size: 1.8rem;
      margin: 0 0 0.75rem;
    }
    .cta-card p {
      color: rgba(248, 247, 255, 0.7);
      margin: 0 auto 2rem;
      max-width: 500px;
    }
    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 600px) {
      .faqs-header h1 { font-size: 2rem; }
      .faq-question { flex-wrap: wrap; }
      .q-badge { order: -1; }
    }
  `]
})
export class FaqsComponent {
  selectedCategory = signal<'all' | 'general' | 'planes' | 'proyeccion' | 'seguridad'>('all');

  faqs: FaqItem[] = [
    {
      id: 1,
      category: 'general',
      question: '¿Qué es PhotoWall y cómo funciona en mi evento?',
      answer: 'PhotoWall es la plataforma definitiva para capturar y proyectar recuerdos en tiempo real. Creas tu evento en 1 minuto, descargas o muestras tu código QR, y tus invitados podrán subir fotos y videos instantáneamente desde sus teléfonos sin instalar ninguna aplicación. Todo el material se proyecta en vivo en tu pantalla gigante o proyector.'
    },
    {
      id: 2,
      category: 'general',
      question: '¿Los invitados necesitan descargar alguna app de la tienda?',
      answer: '¡No! Esa es la mayor ventaja de PhotoWall. Los invitados solo escanean el código QR con la cámara de su teléfono móvil o abren el enlace desde cualquier navegador (Chrome, Safari, etc.) y pueden empezar a tomar y subir fotos de inmediato.'
    },
    {
      id: 3,
      category: 'planes',
      question: '¿Cómo se cobran los planes de PhotoWall? ¿Es una suscripción mensual?',
      answer: 'No cobramos suscripciones mensuales ni tarifas recurrentes ni costos ocultos. Pagas una única vez por cada evento que organices según las funciones y capacidad que necesites (Esencial, Estándar o Premium). Si eliges el plan Gratis, puedes usar la plataforma sin ingresar datos de tarjeta.'
    },
    {
      id: 4,
      category: 'planes',
      question: '¿Cuánto tiempo permanece activa mi galería después del evento?',
      answer: 'El tiempo de acceso depende de tu plan: el Plan Gratis mantiene tu galería en línea por 3 días, el Plan Esencial por 30 días (1 mes), el Plan Estándar por 180 días (6 meses), y el Plan Premium por 365 días (1 año completo). Puedes descargar todo antes de que caduque.'
    },
    {
      id: 5,
      category: 'planes',
      question: '¿Cómo puedo descargar todas las fotos y videos de mi boda o fiesta?',
      answer: 'En los planes Esencial, Estándar y Premium cuentas con un botón de "Descargar ZIP" en tu panel de administración. Al pulsarlo, el sistema empaquetará automáticamente todas las fotos y videos originales en alta resolución para que los guardes en tu computadora o nube para siempre.'
    },
    {
      id: 6,
      category: 'proyeccion',
      question: '¿Cómo funciona la pantalla gigante o proyector durante el evento?',
      answer: 'Al crear tu evento, te damos una URL única de proyección (/projection/tu-evento). Solo abres ese enlace en una computadora portátil conectada al proyector, pantalla o Smart TV del salón. A medida que los invitados suben fotos, estas aparecerán en pantalla con transiciones automáticas sin tener que refrescar la página.'
    },
    {
      id: 7,
      category: 'proyeccion',
      question: '¿Puedo moderar o borrar fotos o videos inapropiados en tiempo real?',
      answer: '¡Sí! Desde tu panel de control de organizador puedes supervisar en vivo todo lo que entra. Si detectas una fotografía borrosa, repetida o inapropiada, presionas el botón de eliminar y desaparecerá instantáneamente de la galería y de la pantalla gigante antes o durante la proyección.'
    },
    {
      id: 8,
      category: 'proyeccion',
      question: '¿Qué hago si un invitado molesto o intruso sube spam al evento?',
      answer: 'Además de borrar sus fotos, cuentas con la pestaña de "Invitados conectados" en tu administración. Ahí puedes identificar al usuario por su nombre y presionar "Desactivar acceso", lo cual revoca inmediatamente su token de sesión e imposibilita que suba más material al evento.'
    },
    {
      id: 9,
      category: 'planes',
      question: '¿Qué métodos de pago internacional aceptan?',
      answer: 'Aceptamos pagos rápidos, cifrados y 100% seguros a nivel global a través de PayPal. Puedes pagar usando tu saldo disponible de PayPal, tarjetas de crédito (Visa, Mastercard, American Express) o tarjetas de débito internacional en dólares (USD).'
    },
    {
      id: 10,
      category: 'general',
      question: '¿Es posible personalizar los colores y la portada del evento?',
      answer: '¡Por supuesto! PhotoWall te permite personalizar el color de acento de la interfaz (para que combine perfectamente con la decoración de tu evento), así como cargar imágenes personalizadas para la portada del evento y el avatar del organizador.'
    },
    {
      id: 11,
      category: 'seguridad',
      question: '¿Qué sucede si el WiFi del salón falla por unos momentos?',
      answer: 'Si el internet tiene una interrupción breve, la pantalla de proyección continuará mostrando de forma cíclica las fotos que ya haya descargado en memoria. Tan pronto se restablezca la conexión, el sistema se reconectará de forma invisible y sincronizará las nuevas capturas al instante.'
    },
    {
      id: 12,
      category: 'seguridad',
      question: '¿Las fotos de mi evento son públicas para todo el mundo?',
      answer: 'No. Únicamente las personas que tengan el enlace exacto o el código QR de tu evento podrán entrar, ver o subir fotos a tu galería. Tus fotos y datos están protegidos en servidores seguros y tú tienes la última palabra sobre el contenido.'
    }
  ];

  filteredFaqs = signal<FaqItem[]>(this.faqs);

  setCategory(cat: 'all' | 'general' | 'planes' | 'proyeccion' | 'seguridad') {
    this.selectedCategory.set(cat);
    if (cat === 'all') {
      this.filteredFaqs.set(this.faqs);
    } else {
      this.filteredFaqs.set(this.faqs.filter(f => f.category === cat));
    }
  }

  toggleItem(id: number) {
    this.faqs = this.faqs.map(item => {
      if (item.id === id) {
        return { ...item, isOpen: !item.isOpen };
      }
      return item;
    });
    this.setCategory(this.selectedCategory());
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      general: 'General',
      planes: 'Planes y Pagos',
      proyeccion: 'Proyección',
      seguridad: 'Seguridad'
    };
    return labels[cat] || cat;
  }
}
