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
          <h2>✅ ¡Pago confirmado!</h2>
          <p>Tu plan ya está activo.</p>
          <a [routerLink]="['/events', eventId]" class="btn-pw-primary">Ver mi evento</a>
        } @else if (status() === 'rejected') {
          <h2>❌ El pago no se completó</h2>
          <p>Puedes intentarlo de nuevo desde tu evento.</p>
          <a [routerLink]="['/events', eventId]" class="btn-pw-ghost">Volver al evento</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .result-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--pw-ink); padding:2rem; }
    .result-card { max-width:420px; text-align:center; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:2.5rem; }
    h2 { margin-bottom:0.75rem; }
    p { color:rgba(248,247,255,0.6); margin-bottom:1.5rem; font-size:0.9rem; }
  `]
})
export class PaymentResultComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private paymentsSvc = inject(PaymentsService);
  status = signal<'pending' | 'approved' | 'rejected'>('pending');
  eventId = '';
  private orderId = '';
  private poll?: ReturnType<typeof setInterval>;
  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id') ?? '';
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') ?? '';
      const boldStatus = this.route.snapshot.queryParamMap.get('bold-tx-status');

    if (!this.orderId) return;
     // Optimista: si Bold ya nos dice el estado, lo mostramos de una vez
  if (boldStatus === 'rejected') {
    this.status.set('rejected');
  }
    this.checkStatus();
    this.poll = setInterval(() => this.checkStatus(), 3000);
  }
  ngOnDestroy() {
    if (this.poll) clearInterval(this.poll);
  }
  private checkStatus() {
    this.paymentsSvc.getStatus(this.orderId).subscribe(res => {
      if (res.status === 'approved' || res.status === 'rejected') {
        this.status.set(res.status as any);
        if (this.poll) clearInterval(this.poll);
      }
    });
  }
}
