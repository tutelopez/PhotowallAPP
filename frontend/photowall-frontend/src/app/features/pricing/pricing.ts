import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PLAN_CATALOG } from '../../shared/models/Plan.model';
import { AuthService } from '../../core/services/auth.service';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="pricing-page">
      <div class="pricing-header">
        <a routerLink="/" class="back-link">← Volver al inicio</a>
        <h1>Elige el plan para tu evento</h1>
        <p>Sin suscripciones — pagas una sola vez por evento</p>
      </div>
      <div class="plans-grid">
        @for (p of plans; track p.plan) {
          <div class="plan-card" [class.plan-card--highlighted]="p.highlighted">
            @if (p.highlighted) { <span class="plan-badge-top">Más elegido</span> }
            <h3>{{ p.name }}</h3>
            <p class="plan-tagline">{{ p.tagline }}</p>
            <div class="plan-price">
              @if (p.priceUSD === 0) {
                <span class="price-amount">Gratis</span>
              } @else {
                <span class="price-amount">&#36;{{ p.priceUSD }}</span>
                <span class="price-unit">USD / evento</span>
              }
            </div>
            <ul class="plan-features">
              @for (f of p.features; track f) { <li>✓ {{ f }}</li> }
            </ul>
            <button class="btn-pw-primary w-full" (click)="choosePlan(p.plan)">
              {{ p.priceCOP === 0 ? 'Empezar gratis' : 'Elegir este plan' }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .pricing-page { min-height: 100vh; padding: 6rem 2rem 5rem; background: var(--pw-ink); }
    .pricing-header { max-width: 700px; margin: 0 auto 3rem; text-align: center; }
    .back-link { display: block; text-align: left; color: rgba(248,247,255,0.5); font-size: 0.875rem; margin-bottom: 2rem; }
    .pricing-header h1 { font-size: 2.25rem; margin-bottom: 0.5rem; }
    .pricing-header p { color: rgba(248,247,255,0.55); }
    .plans-grid {
      max-width: 1100px; margin: 0 auto; display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1.5rem;
    }
    .plan-card {
      position: relative; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px; padding: 1.75rem; display: flex; flex-direction: column;
    }
    .plan-card--highlighted { border-color: rgba(124,58,237,0.6); background: rgba(124,58,237,0.08); }
    .plan-badge-top {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: var(--pw-violet); color: #F8F7FF; font-size: 0.7rem; font-weight: 700;
      padding: 3px 12px; border-radius: 100px;
    }
    .plan-card h3 { font-family: 'Syne', sans-serif; font-size: 1.2rem; margin: 0.5rem 0 0.3rem; }
    .plan-tagline { color: rgba(248,247,255,0.5); font-size: 0.8rem; min-height: 32px; }
    .plan-price { margin: 1rem 0 1.25rem; }
    .price-amount { font-family: 'Syne', sans-serif; font-size: 1.7rem; font-weight: 800; }
    .price-unit { display: block; color: rgba(248,247,255,0.4); font-size: 0.75rem; }
    .plan-features { list-style: none; padding: 0; margin: 0 0 1.5rem; flex: 1; }
    .plan-features li { font-size: 0.85rem; color: rgba(248,247,255,0.75); margin-bottom: 0.6rem; }
    .w-full { width: 100%; justify-content: center; }
  `]
})
export class PricingComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  plans = PLAN_CATALOG;
  choosePlan(plan: string) {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/events/new'], { queryParams: { plan } });
    } else {
      this.router.navigate(['/register'], { queryParams: { plan } });
    }
  }
}
