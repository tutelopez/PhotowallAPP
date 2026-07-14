import { Request, Response } from 'express';
import { io } from '../app';
import { AuthRequest } from '../middlewares/Auth.middlware';
import * as MessageService from '../service/Message.service';
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { eventId, guestId, text } = req.body;
    if (!eventId) return res.status(400).json({ message: 'eventId es obligatorio' });
    if (!guestId) return res.status(400).json({ message: 'guestId es obligatorio' });
    if (!text) return res.status(400).json({ message: 'El mensaje es obligatorio' });
    const newMessage = await MessageService.createMessage(eventId, guestId, text);
    res.status(201).json({
      message: 'Mensaje enviado correctamente',
      data: newMessage
    });
    io.to(`event_${eventId}`).emit('new-message', {
      _id: newMessage._id,
      authorName: newMessage.authorName,
      text: newMessage.text,
      createdAt: newMessage.createdAt
    });
  } catch (error: any) {
    res.status(error.status || 400).json({
      message: error.message || 'Error enviando el mensaje',
      code: error.code
    });
  }
};

export const getMessagesByEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user?.userId;
    if (!organizerId) return res.status(401).json({ message: 'No autorizado' });
    const messages = await MessageService.getMessagesByEvent(eventId, organizerId);
    res.json({ total: messages.length, messages });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Error obteniendo mensajes' });
  }
};
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const organizerId = req.user?.userId;
    if (!organizerId) return res.status(401).json({ message: 'No autorizado' });
    const message = await MessageService.deleteMessage(messageId, organizerId);
    res.json({ message: 'Mensaje eliminado correctamente', data: message });
    io.to(`event_${message.event}`).emit('message-deleted', { _id: message._id });
  } catch (error: any) {
    res.status(error.status || 404).json({ message: error.message });
  }
};