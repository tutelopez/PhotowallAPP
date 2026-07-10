import { Request, Response } from 'express';
import { io } from '../app'; // importar io
import * as PhotoService from '../service/Photo.service';
import { GuestModel } from '../models/Guest.model';
import { UserModel, UserRole } from '../models/User.model';

// 📤 UPLOAD PHOTO
// 📤 UPLOAD PHOTO
export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.body;

    // ✅ Validaciones obligatorias
    if (!req.file) return res.status(400).json({ message: 'La foto es obligatoria' });
    if (!eventId) return res.status(400).json({ message: 'eventId es obligatorio' });
    if (!guestId) return res.status(400).json({ message: 'guestId es obligatorio' });

    // 🔎 buscar invitado en UserModel
    let guest = await UserModel.findOne({ _id: guestId, role: UserRole.GUEST });

    // 🔎 si no se encuentra, buscar en GuestModel (invitado sin login)
    if (!guest) {
      guest = await GuestModel.findById(guestId);
    }

    if (!guest) {
      return res.status(404).json({ message: 'Invitado no encontrado' });
    }

    // 🔔 Subir foto usando PhotoService (que usa Cloudinary)
    const photo = await PhotoService.uploadPhoto(req.file, eventId, guestId);

    // 🌟 reemplazar uploadedBy con el nombre real del invitado
    photo.uploadedBy = guest.name;

    // 📤 Respuesta
    res.status(201).json({
      message: 'Foto subida correctamente',
      photo
    });

    // 🔔 Notificar a todos los clientes conectados a esta sala en tiempo real
    io.to(`event_${eventId}`).emit('new-photo', {
      _id: photo._id,
      uploadedBy: photo.uploadedBy,
      imageUrl: photo.imageUrl,
      createdAt: photo.createdAt
    });

  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Error subiendo la foto' });
  }
};

// 🗑️ DELETE PHOTO
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;

    const photo = await PhotoService.deletePhoto(photoId);

    res.json({
      message: 'Foto eliminada correctamente',
      photo
    });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

// 📖 LISTAR FOTOS DE UN EVENTO
export const getPhotosByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: 'eventId es obligatorio' });
    }

    const photos = await PhotoService.getPhotosByEvent(eventId);

    res.json({
      total: photos.length,
      photos
      // cada foto ahora tiene:
      // imageUrl, uploadedBy, createdAt
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo fotos del evento' });
  }
};


