/**
 * Respuesta del backend al crear una orden de PayPal.
 */
export interface PaypalOrderResponse {
  /** UUID interno de la orden (nuestro identificador) */
  orderId: string;
  /** URL de PayPal a donde redirigir al usuario para que apruebe el pago */
  approveUrl: string;
  /** Monto cobrado */
  amount: number;
  /** Moneda (siempre "USD") */
  currency: string;
}
