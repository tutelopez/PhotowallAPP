import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PaymentService } from '../../../core/services/payments';
import { Router } from '@angular/router';

declare var paypal: any; // Declaramos la variable global del script de PayPal

@Component({
  selector: 'app-paypal-button',
  template: `<div #paypalContainer></div>`, // Contenedor dinámico
  standalone: true // Si usas Angular standalone components, si no, agrégalo a tu AppModule
})
export class PaypalButtonComponent implements AfterViewInit {
  @Input() eventId!: string;
  @Input() plan!: string;
  @ViewChild('paypalContainer', { static: true }) paypalElement!: ElementRef;

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    if (typeof paypal === 'undefined') {
      console.error('El SDK de PayPal no está cargado. Revisa tu index.html');
      return;
    }

    paypal.Buttons({
      // 1. Crear la orden llamando a nuestro backend
      createOrder: (data: any, actions: any) => {
        return new Promise((resolve, reject) => {
          this.paymentService.createOrder(this.eventId, this.plan).subscribe({
            next: (res) => resolve(res.paypalOrderId),
            error: (err) => {
              console.error('Error al crear orden:', err);
              alert('Error al inicializar el pago.');
              reject(err);
            }
          });
        });
      },
      // 2. Capturar el pago tras la aprobación del cliente en PayPal
      onApprove: (data: any, actions: any) => {
        return new Promise((resolve, reject) => {
          this.paymentService.captureOrder(data.orderID).subscribe({
            next: (res) => {
              if (res.status === 'approved') {
                alert(`¡Pago exitoso! Tu evento ahora es plan ${res.plan.toUpperCase()}`);
                // Recargar el componente actual o redirigir al evento
                window.location.reload();
                resolve(true);
              }
            },
            error: (err) => {
              console.error('Error al capturar pago:', err);
              alert('Hubo un problema al procesar tu pago.');
              reject(err);
            }
          });
        });
      },
      // Manejo de errores de UI de PayPal
      onError: (err: any) => {
        console.error('PayPal UI Error:', err);
      }
    }).render(this.paypalElement.nativeElement);
  }
}
