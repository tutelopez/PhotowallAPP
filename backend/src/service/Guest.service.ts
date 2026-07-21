import { GuestModel } from '../models/Guest.model';
import { EventModel } from '../models/Event.model';
import { UserModel } from '../models/User.model';
import { sendFirstGuestEmail } from './Email.service';

export const createGuestById = async (eventId: string, guestName: string) => {
  const event = await EventModel.findOne({
    _id: eventId,
    isActive: true
  });
  if (!event) {
    throw new Error('Evento no encontrado');
  }
  const existingGuestsCount = await GuestModel.countDocuments({ event: event._id });
  const guest = await GuestModel.create({
    event: event._id,
    name: guestName
  });
  if (existingGuestsCount === 0) {
    UserModel.findById(event.organizer)
      .then(organizer => {
        if (organizer) {
          sendFirstGuestEmail(
            { name: organizer.name, email: organizer.email },
            { name: event.name, slug: event.slug }
          );
        }
      })
      .catch(err => console.error('🔴 Error notificando primer invitado:', err));
  }
  return guest;
};