import { GuestModel } from '../models/Guest.model';
import { UserModel, UserRole } from '../models/User.model';
import { MessageModel } from '../models/Message.model';
import { EventModel } from '../models/Event.model';
import { assertMessageLimit } from './Limits.service';

export const createMessage = async (
  eventId: string,
  guestId: string,
  text: string
) => {
  await assertMessageLimit(eventId);
  let guest = await UserModel.findOne({ _id: guestId, role: UserRole.GUEST });
  if (!guest) {
    guest = await GuestModel.findById(guestId);
  }
  if (!guest) {
    throw new Error('Invitado no encontrado');
  }
  const clean = (text || '').trim();
  if (!clean) {
    throw new Error('El mensaje no puede estar vacío');
  }
  if (clean.length > 200) {
    throw new Error('El mensaje es demasiado largo (máx. 200 caracteres)');
  }
  return await MessageModel.create({
    event: eventId,
    authorName: guest.name,
    text: clean
  });
};
export const getMessagesByEvent = async (eventId: string, organizerId: string) => {
  const event = await EventModel.findOne({ _id: eventId, organizer: organizerId });
  if (!event) {
    const err: any = new Error('Evento no encontrado o no autorizado');
    err.status = 403;
    throw err;
  }
  return await MessageModel.find({ event: eventId }).sort({ createdAt: -1 });
};
export const deleteMessage = async (messageId: string, organizerId: string) => {
  const msg = await MessageModel.findById(messageId);
  if (!msg) {
    const err: any = new Error('Mensaje no encontrado');
    err.status = 404;
    throw err;
  }
  const event = await EventModel.findById(msg.event);
  if (!event) {
    const err: any = new Error('Evento no encontrado');
    err.status = 404;
    throw err;
  }
  if (event.organizer.toString() !== organizerId) {
    const err: any = new Error('No autorizado para eliminar este mensaje');
    err.status = 403;
    throw err;
  }
  await msg.deleteOne();
  return msg;
};