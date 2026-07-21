import { Request, Response } from 'express';
import * as EventService from '../service/Event.service';
import { io } from '../app';
import { sendPlanUpgradeRequestEmail, sendPlanRequestConfirmationEmail } from '../service/Email.service';
import { UserModel } from '../models/User.model';
import { PlanType } from '../models/Plan';

export const create = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).user.userId;

    console.log('🟡 BODY:', req.body);
    console.log('🟡 FILES:', req.files);

    const data = {
      name: req.body.name,
      date: req.body.date,
      type: req.body.type,
      desiredPlan: req.body.desiredPlan,
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
  try {

    const organizerId = (req as any).user.userId;

    const events = await EventService.getEventsByOrganizer(organizerId);

    res.json(events);

  } catch (error) {

    res.status(500).json({
      message: 'Error obteniendo eventos'
    });

  }
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

export const toggleMessages = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = (req as any).user.userId;
    const { enabled } = req.body;
    const event = await EventService.toggleMessages(eventId, organizerId, !!enabled);
    res.json({ message: 'Preferencia de mensajes actualizada', event });
    io.to(`event_${eventId}`).emit('messages-toggle', { enabled: event.messagesEnabled });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error actualizando mensajes' });
  }
};

export const updateBranding = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = (req as any).user.userId;
    const { accentColor } = req.body;
    if (!accentColor) {
      return res.status(400).json({ message: 'accentColor es obligatorio' });
    }
    const event = await EventService.updateBranding(eventId, organizerId, accentColor);
    res.json({ message: 'Color actualizado correctamente', event });
   io.to(`event_${eventId}`).emit('branding-updated', {
  accentColor: event.branding?.accentColor ?? '#7C3AED'
});
  } catch (error: any) {
    res.status(error.status || 400).json({ message: error.message, code: error.code });
  }
};

export const regenerateQR = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = (req as any).user.userId;
    const event = await EventService.regenerateQR(eventId, organizerId);
    res.json({ message: 'QR regenerado correctamente', event });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error regenerando QR' });
  }
};

export const requestPlanUpgrade = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = (req as any).user.userId;
    const { desiredPlan } = req.body;
    const event = await EventService.requestPlanUpgrade(eventId, organizerId, desiredPlan);
    res.json({ message: 'Solicitud registrada, te contactaremos pronto', event });
    const organizer = await UserModel.findById(organizerId);
    if (organizer) {
      sendPlanUpgradeRequestEmail(
        { name: organizer.name, email: organizer.email },
        { name: event.name, slug: event.slug },
        desiredPlan as PlanType
      );
      sendPlanRequestConfirmationEmail(
        { name: organizer.name, email: organizer.email },
        { name: event.name },
        desiredPlan as PlanType
      );
    }
  } catch (error: any) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

export const cancelPendingPlan = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = (req as any).user.userId;
    const event = await EventService.cancelPendingPlan(eventId, organizerId);
    res.json({ message: 'Solicitud de pago cancelada', event });
  } catch (error: any) {
    res.status(error.status || 400).json({ message: error.message });
  }
};