import { Request, Response } from 'express';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary';
import { PhotoModel } from '../models/Photo.model';
import { PaymentModel } from '../models/Payment.model';
import { EventModel } from '../models/Event.model';
import { UserModel } from '../models/User.model';
import { sendPlanThankYouEmail } from '../service/Email.service';
import { PlanType } from '../models/Plan';
import { io } from '../app';

export const handleCloudinaryModeration = async (req: Request, res: Response) => {
  try {
    const timestamp = req.header('X-Cld-Timestamp') || '';
    const signature = req.header('X-Cld-Signature') || '';
    const rawBody = (req.body as Buffer).toString();
    const isValid = cloudinary.utils.verifyNotificationSignature(
      rawBody,
      Number(timestamp),
      signature
    );
    if (!isValid) {
      return res.status(401).json({ message: 'Firma inválida' });
    }
    const payload = JSON.parse(rawBody);
    if (payload.notification_type !== 'moderation') {
      return res.status(200).json({ received: true });
    }
    const moderationResult = payload.moderation?.[0];
    const status = moderationResult?.status;
    const photo = await PhotoModel.findOne({ publicId: payload.public_id });
    if (!photo) {
      return res.status(200).json({ received: true });
    }
    if (status === 'approved') {
      io.to(`event_${photo.event}`).emit('new-photo', {
        _id: photo._id,
        uploadedBy: photo.uploadedBy,
        imageUrl: photo.imageUrl,
        createdAt: photo.createdAt
      });
    } else if (status === 'rejected') {
      await cloudinary.uploader.destroy(photo.publicId).catch(() => null);
      await photo.deleteOne();
      console.log(`🗑️ Foto ${photo._id} eliminada automáticamente por moderación de Cloudinary`);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('🔴 Error en webhook de moderación de Cloudinary:', error);
    res.status(500).json({ message: 'Error procesando notificación' });
  }
};

export const handleBoldWebhook = async (req: Request, res: Response) => {
  try {
    const signatureHeader = req.header('x-bold-signature') || '';
    const rawBody = (req.body as Buffer).toString();
    const secretKey = process.env.BOLD_SECRET_KEY || '';
    const encoded = Buffer.from(rawBody, 'utf-8').toString('base64');
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(encoded)
      .digest('hex');
    if (expectedSignature !== signatureHeader) {
      console.warn('⚠️ Firma de webhook de Bold inválida');
      return res.status(401).json({ message: 'Firma inválida' });
    }
    const payload = JSON.parse(rawBody);
    console.log('📩 Webhook de Bold recibido:', JSON.stringify(payload));

    const orderId = payload.reference_id || payload.data?.reference_id || payload.order_id;
    const status = (payload.status || payload.data?.status || '').toUpperCase();
    const transactionId = payload.bold_transaction_id || payload.data?.bold_transaction_id;

    if (!orderId) {
      return res.status(200).json({ received: true });
    }
    const payment = await PaymentModel.findOne({ orderId });
    if (!payment) {
      return res.status(200).json({ received: true });
    }
    const APPROVED_STATUSES = ['APPROVED', 'PAID', 'SUCCESS', 'SUCCESSFUL'];
    const REJECTED_STATUSES = ['REJECTED', 'FAILED', 'DECLINED', 'CANCELLED'];

    if (APPROVED_STATUSES.includes(status) && payment.status !== 'approved') {
      payment.status = 'approved';
      payment.boldTransactionId = transactionId || null;
      await payment.save();
      const event = await EventModel.findById(payment.event);
      if (event) {
        event.plan = payment.plan;
        event.pendingPlan = null;
        await event.save();
        const organizer = await UserModel.findById(payment.organizer);
        if (organizer) {
          sendPlanThankYouEmail(
            { name: organizer.name, email: organizer.email },
            { name: event.name, slug: event.slug, plan: event.plan as PlanType }
          );
        }
      }
    } else if (REJECTED_STATUSES.includes(status)) {
      payment.status = 'rejected';
      await payment.save();
      const event = await EventModel.findById(payment.event);
      if (event) {
      event.pendingPlan = null;
      await event.save();
  }
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('🔴 Error en webhook de Bold:', error);
    res.status(500).json({ message: 'Error procesando webhook' });
  }
};