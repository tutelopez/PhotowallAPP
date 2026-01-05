// controllers/admin/AdminUser.controller.ts
import { Request, Response } from 'express';
import { UserModel, UserRole } from '../models/User.model';
import { EventModel, EventType } from '../models/Event.model';
import { PhotoModel } from '../models/Photo.model';
import cloudinary from '../config/cloudinary';
import slugify from 'slugify';

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET;

export const createSuperAdmin = async (req: Request, res: Response) => {
  try {

    // 🔒 BLOQUEAR FUERA DE DEVELOPMENT
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        message: 'Endpoint deshabilitado fuera de development'
      });
    }

    const { name, email, secret } = req.body;

    if (!name || !email || !secret) {
      return res.status(400).json({
        message: 'name, email y secret son obligatorios'
      });
    }

    if (secret !== process.env.SUPER_ADMIN_SECRET) {
      return res.status(403).json({
        message: 'No autorizado'
      });
    }

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: 'El usuario ya existe'
      });
    }

    const superAdmin = await UserModel.create({
      name,
      email,
      role: UserRole.SUPER_ADMIN
    });

    res.status(201).json({
      message: 'SuperAdmin creado correctamente',
      user: superAdmin
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error creando SuperAdmin'
    });
  }
};


//obtener todos los organizadores
export const getAllOrganizers = async (_req: Request, res: Response) => {
  const organizers = await UserModel.find({
    role: UserRole.ORGANIZER
  }).sort({ createdAt: -1 });

  res.json({
    total: organizers.length,
    organizers
  });
};

//obtener todos los eventos de un organizador
export const getEventsByOrganizer = async (req: Request, res: Response) => {
  const { organizerId } = req.params;

  const events = await EventModel.find({
    organizer: organizerId
  }).sort({ date: -1 });

  res.json({
    total: events.length,
    events
  });
};

//obtener todos los invitados de un organizador
export const getGuestsByOrganizer = async (req: Request, res: Response) => {
  const { organizerId } = req.params;

  // 1️⃣ eventos del organizador
  const events = await EventModel.find(
    { organizer: organizerId },
    '_id'
  );

  const eventIds = events.map(e => e._id);

  // 2️⃣ invitados de esos eventos
  const guests = await UserModel.find({
    role: UserRole.GUEST,
    event: { $in: eventIds }
  }).populate('event', 'name date');

  res.json({
    total: guests.length,
    guests
  });
};

//obtener todos los invitados de un evento
export const getGuestsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: 'eventId es requerido' });
    }

    const guests = await UserModel.find({
      role: UserRole.GUEST,
      event: eventId
    }).sort({ createdAt: 1 });

    res.json({
      total: guests.length,
      guests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo invitados del evento' });
  }
};

//eliminar evento por ID
export const deleteEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    await event.deleteOne();

    res.json({
      message: 'Evento eliminado correctamente',
      eventId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando evento' });
  }
};

//eliminar todos los eventos de un organizador
export const deleteEventsByOrganizer = async (
  req: Request,
  res: Response
) => {
  try {
    const { organizerId } = req.params;

    const result = await EventModel.deleteMany({
      organizer: organizerId
    });

    res.json({
      message: 'Eventos eliminados correctamente',
      deletedEvents: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando eventos' });
  }
};

//eliminar un organizador y todo lo que depende de el
export const deleteOrganizer = async (req: Request, res: Response) => {
  try {
    const { organizerId } = req.params;

    const organizer = await UserModel.findOne({
      _id: organizerId,
      role: UserRole.ORGANIZER
    });

    if (!organizer) {
      return res.status(404).json({ message: 'Organizador no encontrado' });
    }

    // 1️⃣ Eliminar eventos del organizer
    await EventModel.deleteMany({ organizer: organizerId });

    // 2️⃣ Eliminar invitados del organizer
    await UserModel.deleteMany({
      role: UserRole.GUEST,
      organizer: organizerId // si luego decides guardar esta relación
    });

    // 3️⃣ Eliminar organizer
    await organizer.deleteOne();

    res.json({
      message: 'Organizador y todos sus datos fueron eliminados',
      organizerId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando organizador' });
  }
};

//ver todos los eventos
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const adminId = req.header('x-admin-id');

    if (!adminId) {
      return res.status(401).json({ message: 'adminId es requerido' });
    }

    const admin = await UserModel.findById(adminId);

    if (!admin || admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Acceso solo para SuperAdmin' });
    }

    const events = await EventModel.find()
      .populate('organizer', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({
      total: events.length,
      events
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener los eventos' });
  }
};

//eliminar todos los eventos
export const deleteAllEvents = async (req: Request, res: Response) => {
  try {
    const adminId = req.header('x-admin-id');

    if (!adminId) {
      return res.status(401).json({
        message: 'adminId es requerido'
      });
    }

    const admin = await UserModel.findById(adminId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Acceso permitido solo para SuperAdmin'
      });
    }

    const result = await EventModel.deleteMany({});

    return res.json({
      message: 'Todos los eventos fueron eliminados',
      deletedEvents: result.deletedCount
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error eliminando todos los eventos'
    });
  }
};

//ELMINA TODO BASE DE DATOS
export const resetAllData = async (req: Request, res: Response) => {
  try {
    const adminId = req.header('x-admin-id');
    const confirm = req.header('x-confirm'); // confirmación explícita

    if (!adminId) {
      return res.status(401).json({ message: 'adminId es requerido' });
    }

    const admin = await UserModel.findById(adminId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: 'Solo SuperAdmin puede ejecutar esta acción' });
    }

    if (confirm !== 'YES_RESET_ALL') {
      return res.status(400).json({ message: 'Debes enviar header x-confirm: YES_RESET_ALL para confirmar' });
    }

    // 1️⃣ eliminar fotos
    const allPhotos = await PhotoModel.find();
    for (const photo of allPhotos) {
      await cloudinary.uploader.destroy(photo.publicId);
    }
    await PhotoModel.deleteMany({});

    // 2️⃣ eliminar eventos
    await EventModel.deleteMany({});

    // 3️⃣ eliminar organizadores
    await UserModel.deleteMany({ role: UserRole.ORGANIZER });

    // 4️⃣ eliminar invitados
    await UserModel.deleteMany({ role: UserRole.GUEST });

    return res.json({
      message: 'Base de datos reiniciada completamente. Solo quedan los SuperAdmins'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error reiniciando la base de datos' });
  }
};

//poblar base de datos con datos para prueba
export const seedDatabase = async (req: Request, res: Response) => {
  try {
    const adminId = req.header('x-admin-id');

    if (!adminId) {
      return res.status(401).json({ message: 'x-admin-id header es requerido' });
    }

    const admin = await UserModel.findById(adminId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: 'Solo SuperAdmin puede ejecutar esta acción' });
    }

    // 🔹 Limpiar la DB antes de seed (opcional)
    await PhotoModel.deleteMany({});
    await EventModel.deleteMany({});
    await UserModel.deleteMany({ role: { $in: [UserRole.ORGANIZER, UserRole.GUEST] } });

    // 🔹 Crear Organizador
    const organizer = await UserModel.create({
      name: 'Organizador de Prueba',
      email: 'organizer@photowall.com',
      role: UserRole.ORGANIZER
    });

    // 🔹 Crear 2 Eventos
    const eventA = await EventModel.create({
      name: 'Evento A',
      date: new Date('2026-05-10'),
      type: EventType.BODA,
      slug: slugify('Evento A', { lower: true }),
      qrCode: 'QR_PLACEHOLDER_EVENT_A',
      organizer: organizer._id
    });

    const eventB = await EventModel.create({
      name: 'Evento B',
      date: new Date('2026-05-11'),
      type: EventType.CUMPLEANOS,
      slug: slugify('Evento B', { lower: true }),
      qrCode: 'QR_PLACEHOLDER_EVENT_B',
      organizer: organizer._id
    });

    // 🔹 Crear Invitados para Evento A (5)
    const guestsA = [];
    for (let i = 1; i <= 5; i++) {
      guestsA.push({
        name: `Invitado A${i}`,
        email: `invitadoA${i}@mail.com`,
        role: UserRole.GUEST,
        event: eventA._id
      });
    }

    // 🔹 Crear Invitados para Evento B (7)
    const guestsB = [];
    for (let i = 1; i <= 7; i++) {
      guestsB.push({
        name: `Invitado B${i}`,
        email: `invitadoB${i}@mail.com`,
        role: UserRole.GUEST,
        event: eventB._id
      });
    }

    await UserModel.insertMany([...guestsA, ...guestsB]);

    res.status(201).json({
      message: 'Base de datos poblada con datos de prueba',
      organizer,
      events: [eventA, eventB],
      totalGuests: guestsA.length + guestsB.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generando seed de la base de datos' });
  }
};