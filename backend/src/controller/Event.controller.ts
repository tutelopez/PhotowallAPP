import { Request, Response } from 'express';
import * as EventService from '../service/Event.service';


export const create = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).user.userId;

    console.log('🟡 BODY:', req.body);
    console.log('🟡 FILES:', req.files);

    const data = {
      name: req.body.name,
      date: req.body.date,
      type: req.body.type,
      organizerId,

      coverImage: (req.files as any)?.coverImage?.[0],
      profileImage: (req.files as any)?.profileImage?.[0]
    };

    const event = await EventService.createEvent(data);

    res.status(201).json({
      message: 'Evento creado correctamente',
      event
    });
  } catch (error: any) {
    console.error('🔴 ERROR CREATE EVENT:', error);
    res.status(400).json({
      message: error.message || 'Error creando el evento'
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = (req as any).user.userId;

    const data = {
      name: req.body.name,
      date: req.body.date,

      coverImage: (req.files as any)?.coverImage?.[0],
      profileImage: (req.files as any)?.profileImage?.[0]
    };

    const event = await EventService.updateEvent(
      eventId,
      organizerId,
      data
    );

    res.json({
      message: 'Evento actualizado correctamente',
      event
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.message || 'Error actualizando evento'
    });
  }
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

//PARA ADMINISTRAR TODO EL EVENTO
export const getEventManageData = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const data = await EventService.getEventFullData(eventId);

    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({
      message: error.message || 'Error obteniendo evento'
    });
  }
}