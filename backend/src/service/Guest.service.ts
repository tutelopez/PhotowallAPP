// service/Guest.service.ts
import { GuestModel } from '../models/Guest.model';
import { EventModel } from '../models/Event.model';

export const createGuestById = async (eventId: string, guestName: string) => {
  const event = await EventModel.findOne({
    _id: eventId,
    isActive: true
  });

  if (!event) {
    throw new Error('Evento no encontrado');
  }

  return await GuestModel.create({
    event: event._id,
    name: guestName
  });
};
