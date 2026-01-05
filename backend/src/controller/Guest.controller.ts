// controllers/Guest.controller.ts
import { Request, Response } from 'express';
import * as GuestService from '../service/Guest.service';

export const joinEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;   // ahora usamos eventId en lugar de slug
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
      token: guest.token // si luego quieres JWT para invitados
    });
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Evento no disponible' });
  }
};
