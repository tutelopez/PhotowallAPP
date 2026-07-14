import { Response } from 'express';
import { Request } from 'express';
import { io } from '../app';
import * as PhotoService from '../service/Photo.service';
import { GuestModel } from '../models/Guest.model';
import { UserModel, UserRole } from '../models/User.model';
import { AuthRequest } from '../middlewares/Auth.middlware';

export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'La foto es obligatoria' });
    if (!eventId) return res.status(400).json({ message: 'eventId es obligatorio' });
    if (!guestId) return res.status(400).json({ message: 'guestId es obligatorio' });
    let guest = await UserModel.findOne({ _id: guestId, role: UserRole.GUEST });
    if (!guest) {
      guest = await GuestModel.findById(guestId);
    }
    if (!guest) {
      return res.status(404).json({ message: 'Invitado no encontrado' });
    }
    const photo = await PhotoService.uploadPhoto(req.file, eventId, guestId);
    photo.uploadedBy = guest.name;
    res.status(201).json({
      message: 'Foto subida correctamente',
      photo
    });
    io.to(`event_${eventId}`).emit('new-photo', {
      _id: photo._id,
      uploadedBy: photo.uploadedBy,
      imageUrl: photo.imageUrl,
      createdAt: photo.createdAt
    });
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 400).json({
      message: error.message || 'Error subiendo la foto',
      code: error.code
    });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { photoId } = req.params;
    // req.user viene del token JWT del organizador (ver Auth.middlware -> ensureAuth)
    const organizerId = req.user?.userId;
    if (!organizerId) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    const photo = await PhotoService.deletePhoto(photoId, organizerId);
    res.json({
      message: 'Foto eliminada correctamente',
      photo
    });
  } catch (error: any) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

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
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo fotos del evento' });
  }
};