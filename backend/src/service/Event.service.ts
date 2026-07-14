import { EventModel } from '../models/Event.model';
import { generateSlug } from '../utils/slugify';
import { generateEventQR } from '../utils/qr';
import { GuestModel } from '../models/Guest.model';
import { PhotoModel } from '../models/Photo.model';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary';
import { PLAN_LIMITS, PlanType } from '../models/Plan';
import { getUsage } from './Limits.service';



const extractPublicId = (url: string) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};

const DEFAULT_COVER_IMAGE =
  'https://res.cloudinary.com/demo/image/upload/v1700000000/photowall/default-cover.jpg';

const DEFAULT_PROFILE_IMAGE =
  'https://res.cloudinary.com/demo/image/upload/v1700000000/photowall/default-profile.jpg';

export const createEvent = async (data: any) => {
  console.log('🟢 DATA RECIBIDA EN SERVICE:', data);

  if (!data.name || !data.date || !data.type || !data.organizerId) {
    throw new Error('Datos incompletos para crear el evento');
  }

  const slug = generateSlug(data.name);
  const eventUrl = `${process.env.FRONT_URL}/e/${slug}`;
  const qrCode = await generateEventQR(eventUrl);

  let coverImageUrl = DEFAULT_COVER_IMAGE;
  let profileImageUrl = DEFAULT_PROFILE_IMAGE;

  // 🖼️ Portada
  if (data.coverImage) {
    const result = await cloudinary.uploader.upload(
      `data:${data.coverImage.mimetype};base64,${data.coverImage.buffer.toString('base64')}`,
      {
        folder: 'photowall/events/covers'
      }
    );

    coverImageUrl = result.secure_url;
  }

  // 🖼️ Perfil
  if (data.profileImage) {
    const result = await cloudinary.uploader.upload(
      `data:${data.profileImage.mimetype};base64,${data.profileImage.buffer.toString('base64')}`,
      {
        folder: 'photowall/events/profiles'
      }
    );

    profileImageUrl = result.secure_url;
  }

  return await EventModel.create({
    name: data.name,
    date: data.date, 
    type: data.type,
    slug,
    qrCode,
    coverImage: coverImageUrl,
    profileImage: profileImageUrl,
    organizer: data.organizerId
  });
};


export const getEventBySlug = async (slug: string) => {
  const event = await EventModel.findOne({ slug, isActive: true }).lean();
  if (!event) return null;
  const usage = await getUsage(event._id.toString(), event.plan as PlanType);
  return { ...event, usage };
};

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


//traer todos los datos de un evento!
export const getEventFullData = async (eventId: string) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error('ID de evento inválido');
  }

  const event = await EventModel.findById(eventId)
    .populate('organizer', 'name email');

  if (!event) {
    throw new Error('Evento no encontrado');
  }

  // 👥 Invitados
  const guests = await GuestModel.find({ event: eventId })
    .select('name createdAt');

  // 🖼️ Fotos
  const photos = await PhotoModel.find({ event: eventId })
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
const usage = await getUsage(eventId, event.plan as PlanType);
  return {
    event: {
      id: event._id,
      name: event.name,
      date: event.date,
      type: event.type,
      slug: event.slug,
      qrCode: event.qrCode,
      coverImage: event.coverImage,
      profileImage: event.profileImage,
      organizer: event.organizer,
      plan: event.plan,
      messagesEnabled: event.messagesEnabled,
    },

    guests: {
      total: guests.length,
      list: guests
    },

    photos,
    usage
  };
};

//editar evento
export const updateEvent = async (
  eventId: string,
  organizerId: string,
  data: any
) => {
  const event = await EventModel.findOne({
    _id: eventId,
    organizer: organizerId
  });

  if (!event) {
    throw new Error('Evento no encontrado o no autorizado');
  }

  // ✏️ actualizar texto
  if (data.name) event.name = data.name;
  if (data.date) event.date = data.date;

  // 🖼️ actualizar portada
  if (data.coverImage) {
    // eliminar imagen anterior si existe
    if (event.coverImage) {
      const publicId = extractPublicId(event.coverImage);
      await cloudinary.uploader.destroy(publicId);
    }

    const result = await cloudinary.uploader.upload(
      `data:${data.coverImage.mimetype};base64,${data.coverImage.buffer.toString('base64')}`,
      { folder: 'photowall/events/covers' }
    );

    event.coverImage = result.secure_url;
  }

  // 🖼️ actualizar perfil
  if (data.profileImage) {
    if (event.profileImage) {
      const publicId = extractPublicId(event.profileImage);
      await cloudinary.uploader.destroy(publicId);
    }

    const result = await cloudinary.uploader.upload(
      `data:${data.profileImage.mimetype};base64,${data.profileImage.buffer.toString('base64')}`,
      { folder: 'photowall/events/profiles' }
    );

    event.profileImage = result.secure_url;
  }

  await event.save();
  return event;
};

// Habilitar o deshabilitar mensajes en un evento
export const toggleMessages = async (
  eventId: string,
  organizerId: string,
  enabled: boolean
) => {
  const event = await EventModel.findOne({
    _id: eventId,
    organizer: organizerId
  });
  if (!event) {
    throw new Error('Evento no encontrado o no autorizado');
  }
  event.messagesEnabled = enabled;
  await event.save();
  return event;
};