import { GuestModel } from '../models/Guest.model';
import { UserModel, UserRole } from '../models/User.model';
import { MessageModel } from '../models/Message.model';
export const createMessage = async (
  eventId: string,
  guestId: string,
  text: string
) => {
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
export const getMessagesByEvent = async (eventId: string) => {
  return await MessageModel.find({ event: eventId })
    .sort({ createdAt: -1 })
    .limit(50);
};