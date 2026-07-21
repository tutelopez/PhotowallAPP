import { Response } from 'express';
import { AuthRequest } from '../middlewares/Auth.middlware';
import * as PaymentService from '../service/Payment.service';
import { PlanType } from '../models/Plan';

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, plan } = req.body;
    const organizerId = req.user?.userId;
    if (!organizerId) return res.status(401).json({ message: 'No autorizado' });
    if (!eventId || !plan) return res.status(400).json({ message: 'eventId y plan son obligatorios' });
    const intent = await PaymentService.createPaymentIntent(eventId, organizerId, plan as PlanType);
    res.json(intent);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Error creando la intención de pago' });
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const organizerId = req.user?.userId;
    if (!organizerId) return res.status(401).json({ message: 'No autorizado' });
    const payment = await PaymentService.getPaymentStatus(orderId, organizerId);
    res.json({ status: payment.status, plan: payment.plan });
  } catch (error: any) {
    res.status(error.status || 404).json({ message: error.message });
  }
};