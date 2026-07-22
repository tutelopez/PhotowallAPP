import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentsService } from '../../../core/services/payments';

/**
 * Componente legacy — ya no tiene ruta registrada.
 * La página de resultado de pago es PaymentResultComponent (/events/:id/payment-result).
 */
@Component({
  selector: 'app-payment-success',
  standalone: true,
  template: `<p>Redirigiendo...</p>`
})
export class PaymentSuccessComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentsService
  ) {}

  payment: any;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) this.checkPayment(orderId);
    });
  }

  checkPayment(orderId: string) {
    this.paymentService.getStatus(orderId).subscribe({
      next: (payment) => { this.payment = payment; }
    });
  }
}
