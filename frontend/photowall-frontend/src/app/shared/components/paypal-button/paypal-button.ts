import { Component, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PaymentsService } from '../../../core/services/payments';
import { Router } from '@angular/router';

declare var paypal: any;

@Component({
  selector: 'app-paypal-button',
  template: `<div #paypalContainer></div>`,
  standalone: true
})
export class PaypalButtonComponent implements AfterViewInit {
  @Input() eventId!: string;
  @Input() plan!: string;
  @ViewChild('paypalContainer', { static: true }) paypalElement!: ElementRef;

  constructor(
    private paymentService: PaymentsService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    if (typeof paypal === 'undefined') {
      console.error('El SDK de PayPal no está cargado. Revisa tu index.html');
      return;
    }

    paypal.Buttons({
      createOrder: (_data: any, _actions: any) => {
        return new Promise((resolve, reject) => {
          this.paymentService.createOrder(this.eventId, this.plan).subscribe({
            next: (res) => resolve(res.orderId),
            error: (err: any) => {
              console.error('Error al crear orden:', err);
              reject(err);
            }
          });
        });
      },
      onApprove: (data: any, _actions: any) => {
        return new Promise((resolve, reject) => {
          this.paymentService.captureOrder(data.orderID).subscribe({
            next: (res: any) => {
              if (res.status === 'approved') {
                window.location.reload();
                resolve(true);
              }
            },
            error: (err: any) => {
              console.error('Error al capturar pago:', err);
              reject(err);
            }
          });
        });
      },
      onError: (err: any) => {
        console.error('PayPal UI Error:', err);
      }
    }).render(this.paypalElement.nativeElement);
  }
}
