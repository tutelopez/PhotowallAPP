import { Request, Response } from 'express';
import * as GuestService from '../service/Guest.service';

export const joinEvent = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: 'Nombre inválido'
      });
    }

    const guest = await GuestService.createGuest(slug, name);

    res.status(201).json({
  guestId: guest._id,
  token: guest.token,
  name: guest.name
});
  } catch (error) {
    res.status(404).json({ message: 'Evento no disponible' });
  }
};
