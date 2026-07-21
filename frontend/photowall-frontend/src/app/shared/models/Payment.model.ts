export interface PaymentIntent {
  orderId: string;
  amount: number;
  currency: string;
  apiKey: string;
  integritySignature: string;
  description: string;
}
