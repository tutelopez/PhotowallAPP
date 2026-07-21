import crypto from 'crypto';
import { PaymentModel } from '../models/Payment.model';
import { EventModel } from '../models/Event.model';
import { PLAN_PRICES_COP, PlanType } from '../models/Plan';

export const createPaymentIntent = async (
  eventId: string,
  organizerId: string,
  plan: PlanType
) => {
   if (!process.env.BOLD_IDENTITY_KEY || !process.env.BOLD_SECRET_KEY) {
    const err: any = new Error(
      'Bold no está configurado — revisa BOLD_IDENTITY_KEY y BOLD_SECRET_KEY en el .env del backend'
    );
    err.status = 500;
    throw err;
  }
  if (plan === PlanType.FREE || !Object.values(PlanType).includes(plan)) {
    const err: any = new Error('Plan inválido para pago');
    err.status = 400;
    throw err;
  }
  const event = await EventModel.findOne({ _id: eventId, organizer: organizerId });
  if (!event) {
    const err: any = new Error('Evento no encontrado o no autorizado');
    err.status = 403;
    throw err;
  }
  const amount = PLAN_PRICES_COP[plan];
  const orderId = `PW-${eventId}-${Date.now()}`;
  await PaymentModel.create({
    orderId,
    event: event._id,
    organizer: organizerId,
    plan,
    amount,
    status: 'pending'
  });
  event.pendingPlan = plan;
  await event.save();
  const secretKey = process.env.BOLD_SECRET_KEY || '';
  const currency = 'COP';
  const integritySignature = crypto
    .createHash('sha256')
    .update(`${orderId}${amount}${currency}${secretKey}`)
    .digest('hex');
  return {
    orderId,
    amount,
    currency,
    apiKey: process.env.BOLD_IDENTITY_KEY,
    integritySignature,
    description: `Plan ${plan} — ${event.name}`
  };
};

export const getPaymentStatus = async (orderId: string, organizerId: string) => {
  const payment = await PaymentModel.findOne({ orderId, organizer: organizerId });
  if (!payment) {
    const err: any = new Error('Orden no encontrada');
    err.status = 404;
    throw err;
  }
  return payment;
};