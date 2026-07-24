// controllers/admin/AdminUser.controller.ts
import { Request, Response } from 'express';
import { UserModel, UserRole } from '../models/User.model';
import { EventModel, EventType } from '../models/Event.model';
import { PhotoModel } from '../models/Photo.model';
import cloudinary from '../config/cloudinary';
import slugify from 'slugify';
import bcrypt from 'bcrypt';
import { GuestModel } from '../models/Guest.model';
import { PlanType } from '../models/Plan';
import { sendPlanThankYouEmail } from '../service/Email.service';
import { MessageModel } from '../models/Message.model';
import { PaymentModel, PaymentStatus } from '../models/Payment.model';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET;

export const downloadDatabaseBackup = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).superAdmin || await UserModel.findById(req.header('x-admin-id') || (req as any).user?.userId);
    if (!admin || admin.role !== UserRole.SUPER_ADMIN && admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Acceso solo para SuperAdmin' });
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) return res.status(500).json({ message: 'MONGO_URI no está definido' });

    // mongodump --uri="mongodb+srv://..." --archive --gzip
    // Redirigimos el stdout directamente a la respuesta HTTP
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="photowall-backup-${Date.now()}.gz"`);

    const child = exec(`mongodump --uri="${mongoUri}" --archive --gzip`);

    if (child.stdout) {
      child.stdout.pipe(res);
    }
    
    child.on('error', (err) => {
      console.error('Error ejecutando mongodump:', err);
      if (!res.headersSent) res.status(500).json({ message: 'Error generando el respaldo' });
    });

  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ message: 'Error en la solicitud de respaldo' });
  }
};

export const restoreDatabaseBackup = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).superAdmin || await UserModel.findById(req.header('x-admin-id') || (req as any).user?.userId);
    if (!admin || admin.role !== UserRole.SUPER_ADMIN && admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Acceso solo para SuperAdmin' });
    }

    const confirm = req.header('x-confirm');
    if (confirm !== 'RESTAURAR') {
      return res.status(400).json({ message: 'Confirmación inválida. Envía x-confirm: RESTAURAR' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo de respaldo' });
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) return res.status(500).json({ message: 'MONGO_URI no está definido' });

    const filePath = req.file.path;

    // mongorestore --uri="..." --archive=archivo.gz --gzip --drop
    const command = `mongorestore --uri="${mongoUri}" --archive="${filePath}" --gzip --drop`;
    
    exec(command, (error, stdout, stderr) => {
      // Borramos el archivo temporal
      fs.unlink(filePath, (err) => { if (err) console.error('Error borrando archivo temp:', err); });
      
      if (error) {
        console.error('Error restaurando DB:', error);
        return res.status(500).json({ message: 'Error restaurando la base de datos' });
      }
      
      return res.json({ message: 'Base de datos restaurada correctamente' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error procesando la restauración' });
  }
};



export const setEventPlan = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { plan } = req.body;
    if (!Object.values(PlanType).includes(plan)) {
      return res.status(400).json({ message: 'Plan inválido' });
    }
    const event = await EventModel.findByIdAndUpdate(
      eventId,
      { plan },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json({ message: `Plan actualizado a ${plan}`, event });
    if (plan !== PlanType.FREE) {
      const organizer = await UserModel.findById(event.organizer);
      if (organizer) {
        sendPlanThankYouEmail(
          { name: organizer.name, email: organizer.email },
          { name: event.name, slug: event.slug, plan: event.plan as PlanType }
        );
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando el plan' });
  }
};

export const createSuperAdmin = async (req: Request, res: Response) => {
  try {
    // 🔒 BLOQUEAR FUERA DE DEVELOPMENT
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        message: 'Endpoint deshabilitado fuera de development'
      });
    }

    const { name, email, secret, password } = req.body;

    // Validaciones
    if (!name || !email || !secret || !password) {
      return res.status(400).json({
        message: 'name, email, secret y password son obligatorios'
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

    // Hashear la contraseña que envía el usuario
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await UserModel.create({
      name,
      email,
      role: UserRole.SUPER_ADMIN,
      password: hashedPassword
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

  const organizersWithStats = await Promise.all(
    organizers.map(async (org) => {
      const [eventsCount, premiumEventsCount] = await Promise.all([
        EventModel.countDocuments({ organizer: org._id }),
        EventModel.countDocuments({ organizer: org._id, plan: { $ne: PlanType.FREE } })
      ]);
      return {
        ...org.toObject(),
        eventsCount,
        premiumEventsCount
      };
    })
  );

  res.json({
    total: organizersWithStats.length,
    organizers: organizersWithStats
  });
};

//obtener todos los eventos de un organizador
export const getEventsByOrganizer = async (req: Request, res: Response) => {
  const { organizerId } = req.params;

  const events = await EventModel.find({
    organizer: organizerId
  }).sort({ date: -1 });

  const eventsWithStats = await Promise.all(
    events.map(async (ev) => {
      const [photos, messages, guests] = await Promise.all([
        PhotoModel.countDocuments({ event: ev._id }),
        MessageModel.countDocuments({ event: ev._id }),
        UserModel.countDocuments({ role: UserRole.GUEST, event: ev._id })
      ]);
      return {
        ...ev.toObject(),
        stats: { photos, messages, guests }
      };
    })
  );

  res.json({
    total: eventsWithStats.length,
    events: eventsWithStats
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

    // Invitados del UserModel
    const userGuests = await UserModel.find({
      role: UserRole.GUEST,
      event: eventId
    }).sort({ createdAt: 1 });

    // Invitados del GuestModel
    const guestGuests = await GuestModel.find({
      event: eventId
    }).sort({ createdAt: 1 });

    // Combinar resultados, **sin token**
    const allGuests = [
      ...userGuests.map(g => ({
        id: g._id,
        name: g.name,
        email: g.email || null,
        role: g.role || 'guest',
        createdAt: g.createdAt
      })),
      ...guestGuests.map(g => ({
        id: g._id,
        name: g.name,
        role: 'guest',
        createdAt: g.createdAt
        // 🔒 NO incluimos token
      }))
    ];

    res.json({
      total: allGuests.length,
      guests: allGuests
    });

  } catch (error: any) {
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
    const admin = (req as any).superAdmin || await UserModel.findById(req.header('x-admin-id') || (req as any).user?.userId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN && admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Acceso solo para SuperAdmin' });
    }

    const events = await EventModel.find()
      .populate('organizer', 'name email role')
      .sort({ createdAt: -1 });

    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const [photos, messages, guests] = await Promise.all([
          PhotoModel.countDocuments({ event: ev._id }),
          MessageModel.countDocuments({ event: ev._id }),
          UserModel.countDocuments({ role: UserRole.GUEST, event: ev._id })
        ]);
        return {
          ...ev.toObject(),
          stats: { photos, messages, guests }
        };
      })
    );

    return res.json({
      total: eventsWithStats.length,
      events: eventsWithStats
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener los eventos' });
  }
};

//ver todos los pagos (SUPER ADMIN)
export const getAllPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await PaymentModel.find()
      .populate('organizer', 'name email')
      .populate('event', 'name slug')
      .sort({ createdAt: -1 });

    const totalRevenue = payments
      .filter(p => p.status === PaymentStatus.APPROVED)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.json({
      total: payments.length,
      totalRevenue,
      payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pagos' });
  }
};

//ver estadísticas generales del sistema (SUPER ADMIN)
export const getSystemStats = async (_req: Request, res: Response) => {
  try {
    const [totalOrganizers, totalEvents, totalPhotos, totalMessages, totalGuests, payments] = await Promise.all([
      UserModel.countDocuments({ role: UserRole.ORGANIZER }),
      EventModel.countDocuments(),
      PhotoModel.countDocuments(),
      MessageModel.countDocuments(),
      UserModel.countDocuments({ role: UserRole.GUEST }),
      PaymentModel.find({ status: PaymentStatus.APPROVED })
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const premiumEvents = await EventModel.countDocuments({ plan: { $ne: PlanType.FREE } });

    res.json({
      totalOrganizers,
      totalEvents,
      premiumEvents,
      totalPhotos,
      totalMessages,
      totalGuests,
      totalRevenue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas del sistema' });
  }
};

//eliminar todos los eventos
export const deleteAllEvents = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).superAdmin || await UserModel.findById(req.header('x-admin-id') || (req as any).user?.userId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN && admin.role !== 'super_admin') {
      return res.status(403).json({ message: 'Acceso permitido solo para SuperAdmin' });
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
    const confirm = req.header('x-confirm'); // confirmación explícita
    const admin = (req as any).superAdmin || await UserModel.findById(req.header('x-admin-id') || (req as any).user?.userId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN && admin.role !== 'super_admin') {
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
    const admin = (req as any).superAdmin || await UserModel.findById(req.header('x-admin-id') || (req as any).user?.userId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN && admin.role !== 'super_admin') {
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