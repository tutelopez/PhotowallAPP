import cloudinary from '../config/cloudinary';
import { GuestModel } from '../models/Guest.model';
import { PhotoModel } from '../models/Photo.model';
import { EventModel } from '../models/Event.model';
import { UserModel, UserRole } from '../models/User.model';
import { assertPhotoLimit } from './Limits.service';



const MAX_VIDEO_SECONDS = 30;


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
  const isVideo = file.mimetype.startsWith('video/');
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    {
      folder: `photowall/events/${eventId}`,
      resource_type: isVideo ? 'video' : 'image'
    }
  );
  if (isVideo && result.duration && result.duration > MAX_VIDEO_SECONDS) {
    await cloudinary.uploader.destroy(result.public_id, { resource_type: 'video' });
    const err: any = new Error(
      `El video no puede durar más de ${MAX_VIDEO_SECONDS} segundos`
    );
    err.status = 400;
    err.code = 'VIDEO_TOO_LONG';
    throw err;
  }
  return await PhotoModel.create({
    event: eventId,
    uploadedBy: guest.name,
    imageUrl: result.secure_url,
    publicId: result.public_id,
    type: isVideo ? 'video' : 'image',
    duration: isVideo ? result.duration : null
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
  if (event.organizer.toString() !== organizerId) {
    const err: any = new Error('No autorizado para eliminar esta foto');
    err.status = 403;
    throw err;
  }
  await cloudinary.uploader.destroy(photo.publicId, {
    resource_type: photo.type === 'video' ? 'video' : 'image'
  });
  await photo.deleteOne();
  return photo;
};

export const getPhotosByEvent = async (eventId: string) => {
  return await PhotoModel.find({ event: eventId })
    .sort({ createdAt: 1 })
    .select('imageUrl uploadedBy createdAt type duration');
};