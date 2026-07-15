import { GuestModel } from '../models/Guest.model';
import { UserModel, UserRole } from '../models/User.model';
import { MessageModel } from '../models/Message.model';
import { EventModel } from '../models/Event.model';
import { assertMessageLimit } from './Limits.service';
import { filterText } from '../config/wordFilter';


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
  const raw = (text || '').trim();
  if (!raw) {
    throw new Error('El mensaje no puede estar vacío');
  }
  if (raw.length > 200) {
    throw new Error('El mensaje es demasiado largo (máx. 200 caracteres)');
  }
  const { blocked, cleaned } = filterText(raw);
  if (blocked) {
    const err: any = new Error('Tu mensaje contiene contenido no permitido');
    err.status = 400;
    err.code = 'MESSAGE_BLOCKED';
    throw err;
  }
  return await MessageModel.create({
    event: eventId,
    authorName: guest.name,
    text: cleaned
  });
};
export const getMessagesByEvent = async (eventId: string, organizerId: string) => {
  const { EventModel } = await import('../models/Event.model');
  const event = await EventModel.findOne({ _id: eventId, organizer: organizerId });
  if (!event) {
    const err: any = new Error('Evento no encontrado o no autorizado');
    err.status = 403;
    throw err;
  }
  return await MessageModel.find({ event: eventId }).sort({ createdAt: -1 });
};
export const deleteMessage = async (messageId: string, organizerId: string) => {
  const { EventModel } = await import('../models/Event.model');
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