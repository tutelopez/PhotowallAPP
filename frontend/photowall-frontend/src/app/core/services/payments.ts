import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaypalOrderResponse } from '../../shared/models/Payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/payments`;

  /**
   * Crea una orden de PayPal en el backend.
   * Retorna la approveUrl a donde redirigir al usuario.
   */
  createOrder(eventId: string, plan: string): Observable<PaypalOrderResponse> {
    return this.http.post<PaypalOrderResponse>(
      `${this.api}/create-order`,
      { eventId, plan }
    );
  }

  /**
   * Captura el pago después de que el usuario aprueba en PayPal.
   * Llamar cuando la return_url incluye PayerID en los query params.
   */
  captureOrder(orderId: string): Observable<{ status: string; plan: string }> {
    return this.http.post<{ status: string; plan: string }>(
      `${this.api}/${orderId}/capture`,
      {}
    );
  }

  /**
   * Consulta el estado actual de un pago (usado para polling).
   */
  getStatus(orderId: string): Observable<{ status: string; plan: string }> {
    return this.http.get<{ status: string; plan: string }>(
      `${this.api}/${orderId}/status`
    );
  }

}
