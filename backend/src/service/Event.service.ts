import { EventModel } from '../models/Event.model';
import { generateSlug } from '../utils/slugify';
import { generateEventQR } from '../utils/qr';

export const createEvent = async (data: any) => {
  const slug = generateSlug(data.name);
  const eventUrl = `${process.env.FRONT_URL}/e/${slug}`;
  const qrCode = await generateEventQR(eventUrl);

  return await EventModel.create({
    ...data,
    slug,
    qrCode,
    organizer: data.organizerId
  });

 

};

export const getEventBySlug = async (slug: string) => {
  return await EventModel.findOne({ slug, isActive: true });}

export const getEventsByOrganizer = async (organizerId: string) => {
  return await EventModel.find({
    organizer: organizerId,
    isActive: true
  }).sort({ date: 1 });
};

export const getEventByIdForOrganizer = async (
  eventId: string,
  organizerId: string
) => {
  const event = await EventModel.findOne({
    _id: eventId,
    organizer: organizerId
  });

  if (!event) {
    throw new Error('Evento no encontrado o no autorizado');
  }

  return event;
};
