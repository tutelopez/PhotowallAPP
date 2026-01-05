import cloudinary from '../config/cloudinary';
import { GuestModel } from '../models/Guest.model';
import { PhotoModel } from '../models/Photo.model';
import { UserModel, UserRole } from '../models/User.model';

export const uploadPhoto = async (
  file: Express.Multer.File,
  eventId: string,
  guestId: string
) => {
  // 1️⃣ buscar invitado en UserModel (invitados con login)
  let guest = await UserModel.findOne({ _id: guestId, role: UserRole.GUEST });

  // 2️⃣ si no existe, buscar en GuestModel (invitados sin login)
  if (!guest) {
    guest = await GuestModel.findById(guestId);
  }

  if (!guest) {
    throw new Error('Invitado no encontrado');
  }

  // 3️⃣ Validar que el invitado pertenezca al evento si tiene la propiedad event
  if ((guest as any).event && (guest as any).event.toString() !== eventId) {
    throw new Error('Invitado no pertenece a este evento');
  }

  // 4️⃣ subir a Cloudinary
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    {
      folder: `photowall/events/${eventId}`
    }
  );

  // 5️⃣ guardar en Mongo
  return await PhotoModel.create({
    event: eventId,
    uploadedBy: guest.name,
    imageUrl: result.secure_url,
    publicId: result.public_id
  });
};

//ELIMINAR UNA FOTO DE UN EVENTO
export const deletePhoto = async (photoId: string) => {
  const photo = await PhotoModel.findById(photoId);

  if (!photo) {
    throw new Error('Foto no encontrada');
  }

  await cloudinary.uploader.destroy(photo.publicId);
  await photo.deleteOne();

  return photo;
};

// Obtener todas las fotos de un evento
export const getPhotosByEvent = async (eventId: string) => {
  return await PhotoModel.find({ event: eventId })
    .sort({ createdAt: 1 })
    .select('imageUrl uploadedBy createdAt'); // 👈 solo campos que queremos mostrar
};

