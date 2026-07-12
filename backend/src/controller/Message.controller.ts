import { Request, Response } from 'express';
import { io } from '../app';
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
    res.status(400).json({ message: error.message || 'Error enviando el mensaje' });
  }
};
export const getMessagesByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const messages = await MessageService.getMessagesByEvent(eventId);
    res.json({ total: messages.length, messages });
  } catch (error: any) {
    res.status(500).json({ message: 'Error obteniendo mensajes' });
  }
};