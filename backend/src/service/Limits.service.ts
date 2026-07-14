import { EventModel } from '../models/Event.model';
import { PhotoModel } from '../models/Photo.model';
import { MessageModel } from '../models/Message.model';
import { PLAN_LIMITS, PlanType } from '../models/Plan';
export const assertPhotoLimit = async (eventId: string) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    const err: any = new Error('Evento no encontrado');
    err.status = 404;
    throw err;
  }
  const limits = PLAN_LIMITS[event.plan as PlanType];
  if (limits.maxPhotos === null) return;
  const count = await PhotoModel.countDocuments({ event: eventId });
  if (count >= limits.maxPhotos) {
    const err: any = new Error(
      `Este evento alcanzó el límite de ${limits.maxPhotos} fotos de su plan actual`
    );
    err.status = 403;
    err.code = 'PHOTO_LIMIT_REACHED';
    throw err;
  }
};
export const assertMessageLimit = async (eventId: string) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    const err: any = new Error('Evento no encontrado');
    err.status = 404;
    throw err;
  }
  const limits = PLAN_LIMITS[event.plan as PlanType];
  if (limits.maxMessages === null) return;
  const count = await MessageModel.countDocuments({ event: eventId });
  if (count >= limits.maxMessages) {
    const err: any = new Error(
      `Este evento alcanzó el límite de ${limits.maxMessages} mensajes de su plan actual`
    );
    err.status = 403;
    err.code = 'MESSAGE_LIMIT_REACHED';
    throw err;
  }
};
export const getUsage = async (eventId: string, plan: PlanType) => {
  const limits = PLAN_LIMITS[plan];
  const [photoCount, messageCount] = await Promise.all([
    PhotoModel.countDocuments({ event: eventId }),
    MessageModel.countDocuments({ event: eventId })
  ]);
  return {
    plan,
    maxPhotos: limits.maxPhotos,
    currentPhotos: photoCount,
    maxMessages: limits.maxMessages,
    currentMessages: messageCount,
    watermark: limits.watermark,
    branding: limits.branding,
    galleryDays: limits.galleryDays
  };
};