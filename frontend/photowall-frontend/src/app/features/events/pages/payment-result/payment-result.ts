import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentsService } from '../../../../core/services/payments';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="result-page">
      <div class="result-card">

        @if (status() === 'pending') {
          <div class="pw-spinner"></div>
          <h2>Confirmando tu pago…</h2>
          <p>Esto puede tardar unos segundos, no cierres esta ventana.</p>

        } @else if (status() === 'approved') {
          <div class="success-icon">✅</div>
          <h2>¡Pago confirmado!</h2>
          <p>Tu plan ya está activo. Puedes empezar a compartir tu evento.</p>
          <a [routerLink]="['/events', eventId]" class="btn-pw-primary">Ver mi evento</a>

        } @else if (status() === 'cancelled') {
          <div class="cancel-icon">🚫</div>
          <h2>Pago cancelado</h2>
          <p>Cancelaste el proceso de pago. Puedes intentarlo de nuevo desde tu evento.</p>
          <a [routerLink]="['/events', eventId]" class="btn-pw-ghost">Volver al evento</a>

        } @else if (status() === 'rejected') {
          <div class="error-icon">❌</div>
          <h2>El pago no se completó</h2>
          <p>Hubo un problema procesando el pago. Puedes intentarlo de nuevo.</p>
          <a [routerLink]="['/events', eventId]" class="btn-pw-ghost">Volver al evento</a>
        }

      </div>
    </div>
  `,
  styles: [`
    .result-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--pw-ink);
      padding: 2rem;
    }
    .result-card {
      max-width: 440px;
      width: 100%;
      text-align: center;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .success-icon, .cancel-icon, .error-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    h2 { margin: 0.5rem 0 0.25rem; }
    p {
      color: rgba(248,247,255,0.6);
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  `]
})
export class PaymentResultComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private paymentsSvc = inject(PaymentsService);

  status = signal<'pending' | 'approved' | 'rejected' | 'cancelled'>('pending');
  eventId = '';
  private orderId = '';
  private poll?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id') ?? '';
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') ?? '';
    const payerId = this.route.snapshot.queryParamMap.get('PayerID');
    const cancelled = this.route.snapshot.queryParamMap.get('cancelled');

    if (!this.orderId) return;

    // El usuario canceló en PayPal
    if (cancelled === 'true') {
      this.status.set('cancelled');
      return;
    }

    // El usuario aprobó el pago: PayPal devuelve PayerID en la URL
    if (payerId) {
      this.capturePayment();
    } else {
      // Fallback: polling por si llega vía webhook antes de que el usuario regrese
      this.checkStatus();
      this.poll = setInterval(() => this.checkStatus(), 3000);
    }
  }

  ngOnDestroy() {
    if (this.poll) clearInterval(this.poll);
  }

  /** Captura el pago en el backend y muestra el resultado */
  private capturePayment() {
    this.paymentsSvc.captureOrder(this.orderId).subscribe({
      next: (res) => {
        this.status.set(res.status as any);
      },
      error: () => {
        // Si la captura falla, hacer polling como fallback
        this.checkStatus();
        this.poll = setInterval(() => this.checkStatus(), 3000);
      }
    });
  }

  /** Consulta el estado del pago (polling de seguridad) */
  private checkStatus() {
    this.paymentsSvc.getStatus(this.orderId).subscribe({
      next: (res) => {
        if (res.status === 'approved' || res.status === 'rejected') {
          this.status.set(res.status as any);
          if (this.poll) clearInterval(this.poll);
        }
      },
      error: () => {
        if (this.poll) clearInterval(this.poll);
      }
    });
  }
}
