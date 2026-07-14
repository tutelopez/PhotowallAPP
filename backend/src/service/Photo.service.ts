import cloudinary from '../config/cloudinary';
import { GuestModel } from '../models/Guest.model';
import { PhotoModel } from '../models/Photo.model';
import { EventModel } from '../models/Event.model';
import { UserModel, UserRole } from '../models/User.model';
import { assertPhotoLimit } from './Limits.service';

export const uploadPhoto = async (
  file: Express.Multer.File,
  eventId: string,
  guestId: string
) => {
  await assertPhotoLimit(eventId);
  let guest = await UserModel.findOne({ _id: guestId, role: UserRole.GUEST });
  if (!guest) {
    guest = await GuestModel.findById(guestId);
  }
  if (!guest) {
    throw new Error('Invitado no encontrado');
  }
  if ((guest as any).event && (guest as any).event.toString() !== eventId) {
    throw new Error('Invitado no pertenece a este evento');
  }
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    { folder: `photowall/events/${eventId}` }
  );
  return await PhotoModel.create({
    event: eventId,
    uploadedBy: guest.name,
    imageUrl: result.secure_url,
    publicId: result.public_id
  });
};

export const deletePhoto = async (photoId: string, organizerId: string) => {
  const photo = await PhotoModel.findById(photoId);
  if (!photo) {
    const err: any = new Error('Foto no encontrada');
    err.status = 404;
    throw err;
  }

  const event = await EventModel.findById(photo.event);
  if (!event) {
    const err: any = new Error('Evento no encontrado');
    err.status = 404;
    throw err;
  }

  // Solo el organizador dueño del evento puede borrar la foto
  if (event.organizer.toString() !== organizerId) {
    const err: any = new Error('No autorizado para eliminar esta foto');
    err.status = 403;
    throw err;
  }

  await cloudinary.uploader.destroy(photo.publicId);
  await photo.deleteOne();
  return photo;
};

export const getPhotosByEvent = async (eventId: string) => {
  return await PhotoModel.find({ event: eventId })
    .sort({ createdAt: 1 })
    .select('imageUrl uploadedBy createdAt');
};