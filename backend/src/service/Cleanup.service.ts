import cloudinary from '../config/cloudinary';
import { EventModel } from '../models/Event.model';
import { PhotoModel } from '../models/Photo.model';
import { MessageModel } from '../models/Message.model';
import { PLAN_LIMITS, PlanType } from '../models/Plan';

export const cleanupExpiredGalleries = async () => {
  const now = Date.now();
  const events = await EventModel.find({ isActive: true });
  let archivedCount = 0;
  for (const event of events) {
    const plan = (event.plan as PlanType) || PlanType.FREE;
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS[PlanType.FREE];
    const galleryDays = limits.galleryDays;
    if (galleryDays === null) continue; // plan sin fecha de vencimiento
    const anchorDate = new Date(event.date).getTime();
    const expiresAt = anchorDate + galleryDays * 24 * 60 * 60 * 1000;
    if (expiresAt > now) continue; // todavía no vence
    try {
      const folder = `photowall/events/${event._id}`;
      await cloudinary.api
        .delete_resources_by_prefix(folder, { resource_type: 'image' })
        .catch(() => null);
      await cloudinary.api
        .delete_resources_by_prefix(folder, { resource_type: 'video' })
        .catch(() => null);
      await cloudinary.api.delete_folder(folder).catch(() => null);
      await PhotoModel.deleteMany({ event: event._id });
      await MessageModel.deleteMany({ event: event._id });
      event.isActive = false;
      (event as any).archivedAt = new Date();
      await event.save();
      archivedCount++;
      console.log(`🗑️  Evento "${event.name}" (${event.slug}) archivado — galería vencida`);
    } catch (err) {
      console.error(`⚠️ Error archivando evento ${event.slug}:`, err);
    }
  }
  if (archivedCount > 0) {
    console.log(`✅ Limpieza completada: ${archivedCount} evento(s) archivado(s)`);
  }
  return archivedCount;
};