import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/payments`;

  createOrder(eventId: string, plan: string): Observable<any> {

    return this.http.post(

      `${this.api}/create-order`,

      {

        eventId,

        plan

      }

    );

  }

  getPaymentStatus(orderId: string): Observable<any> {

    return this.http.get(

      `${this.api}/${orderId}/status`

    );

  }

}
