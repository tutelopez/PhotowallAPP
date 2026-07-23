import { Response } from 'express';
import { Request } from 'express';
import { io } from '../app';
import * as PhotoService from '../service/Photo.service';
import { GuestModel } from '../models/Guest.model';
import { UserModel, UserRole } from '../models/User.model';
import { AuthRequest } from '../middlewares/Auth.middlware';

import { EventModel } from '../models/Event.model';
import { ZipArchive } from 'archiver';


export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const { eventId, guestId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'La foto es obligatoria' });
    
    // Validar límite de peso de archivo (10MB fotos, 60MB videos)
    if (req.file.mimetype.startsWith('image/') && req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: 'Las fotos no pueden pesar más de 10MB' });
    }
    if (req.file.mimetype.startsWith('video/') && req.file.size > 60 * 1024 * 1024) {
      return res.status(400).json({ message: 'Los videos no pueden pesar más de 60MB' });
    }
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
  createdAt: photo.createdAt,
  type: photo.type,
  duration: photo.duration
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
    io.to(`event_${photo.event}`).emit('photo-deleted', { _id: photo._id });
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

export const downloadPhotosZip = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user?.userId;
    if (!organizerId) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    const event = await EventModel.findOne({ _id: eventId, organizer: organizerId });
    if (!event) {
      return res.status(403).json({ message: 'Evento no encontrado o no autorizado' });
    }
    const photos = await PhotoService.getPhotosByEvent(eventId);
    if (!photos.length) {
      return res.status(404).json({ message: 'Este evento aún no tiene fotos' });
    }
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${event.slug}-fotos.zip"`);
    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (err: Error) => {
      console.error('🔴 Error generando ZIP:', err);
      if (!res.headersSent) res.status(500).end();
    });
    archive.pipe(res);
    let index = 1;
    for (const photo of photos) {
      try {
        const response = await fetch(photo.imageUrl);
        if (!response.ok) continue;
        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = photo.imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
        const safeName = (photo.uploadedBy || 'invitado')
          .replace(/[^a-zA-Z0-9-_ ]/g, '')
          .trim() || 'invitado';
        archive.append(buffer, {
          name: `${String(index).padStart(3, '0')}-${safeName}.${ext}`
        });
        index++;
      } catch (err) {
        console.error(`⚠️ No se pudo incluir la foto ${photo._id}:`, err);
      }
    }
    await archive.finalize();
  } catch (error: any) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generando el ZIP' });
    }
  }
};