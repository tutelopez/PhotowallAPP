import { Request, Response } from 'express';
import * as EventService from '../service/Event.service';

export const create = async (req: Request, res: Response) => {
  const event = await EventService.createEvent(req.body);
  res.status(201).json(event);
};

export const getBySlug = async (req: Request, res: Response) => {
  const event = await EventService.getEventBySlug(req.params.slug);
  if (!event) return res.status(404).json({ message: 'Evento no encontrado' });
  res.json(event);
};

export const getMyEvents = async (req: Request, res: Response) => {
  const { organizerId } = req.params;

  const events = await EventService.getEventsByOrganizer(organizerId);

  res.json(events);
};

export const getEventDetail = async (req: Request, res: Response) => {
  try {
    const { eventId, organizerId } = req.params;

    const event = await EventService.getEventByIdForOrganizer(
      eventId,
      organizerId
    );

    res.json(event);
  } catch (error) {
    res.status(403).json({ message: 'Acceso no autorizado' });
  }
};
