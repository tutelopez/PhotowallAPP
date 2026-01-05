import { GuestModel } from '../models/Guest.model';
import { EventModel } from '../models/Event.model';

export const createGuest = async (
  eventSlug: string,
  guestName: string
) => {
  const event = await EventModel.findOne({
    slug: eventSlug,
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
