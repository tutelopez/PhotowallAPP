import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PlanType } from '../../shared/models/Plan.model';
import { PaymentIntent } from '../../shared/models/Payment.model';
@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payments`;
  createIntent(eventId: string, plan: PlanType) {
    return this.http.post<PaymentIntent>(`${this.base}/create-intent`, { eventId, plan });
  }
  getStatus(orderId: string) {
    return this.http.get<{ status: string; plan: string }>(`${this.base}/${orderId}/status`);
  }
}
