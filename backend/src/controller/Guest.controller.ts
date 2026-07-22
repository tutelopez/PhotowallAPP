import { Request, Response } from 'express';
import { io } from '../app';
import * as GuestService from '../service/Guest.service';
export const joinEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: 'Nombre inválido'
      });
    }
    const guest = await GuestService.createGuestById(eventId, name);
    res.status(201).json({
      guestId: guest._id,
      name: guest.name,
      token: guest.token
    });
    io.to(`event_${eventId}`).emit('guest-joined', {
      _id: guest._id,
      name: guest.name,
      joinedAt: guest.get('createdAt')
    });
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Evento no disponible' });
  }
};

export const disableGuest = async (req: any, res: Response) => {
  try {
    const { eventId, guestId } = req.params;
    const organizerId = req.user?.userId;
    if (!organizerId) return res.status(401).json({ message: 'No autorizado' });
    const guest = await GuestService.disableGuestById(eventId, guestId, organizerId);
    io.to(`event_${eventId}`).emit('guest-disabled', { guestId });
    res.json({ message: 'Acceso desactivado correctamente', guest });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error desactivando invitado' });
  }
};