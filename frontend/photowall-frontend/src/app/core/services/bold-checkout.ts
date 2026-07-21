import { Injectable } from '@angular/core';
import { PaymentIntent } from '../../shared/models/Payment.model';
declare global {
  interface Window { BoldCheckout: any; }
}
@Injectable({ providedIn: 'root' })
export class BoldCheckoutService {
  private scriptLoaded = false;
  private loadingPromise?: Promise<void>;
  private loadScript(): Promise<void> {
    if (this.scriptLoaded) return Promise.resolve();
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      script.onload = () => { this.scriptLoaded = true; resolve(); };
      script.onerror = () => reject(new Error('No se pudo cargar el script de Bold'));
      document.head.appendChild(script);
    });
    return this.loadingPromise;
  }
  async open(intent: PaymentIntent, redirectionUrl: string) {
    await this.loadScript();
    const checkout = new window.BoldCheckout({
      orderId: intent.orderId,
      currency: intent.currency,
      amount: String(intent.amount),
      apiKey: intent.apiKey,
      integritySignature: intent.integritySignature,
      description: intent.description,
      redirectionUrl
    });
    checkout.open();
  }
}
