import { Router } from 'express';
import { requireSuperAdmin } from '../middlewares/requireSuperAdmin.middleware';
import {
    createSuperAdmin, 
    getAllOrganizers,
    getEventsByOrganizer,
     getGuestsByOrganizer,
      getGuestsByEvent,
      deleteEventById,
      deleteEventsByOrganizer,
      deleteOrganizer,
      getAllEvents,
      deleteAllEvents,
      resetAllData,
      seedDatabase 
    } from '../controller/Admin.controller';

const router = Router();


//crear superadmin
router.post('/super-admin', createSuperAdmin);

//proteger rutas
router.use(requireSuperAdmin);

// GET (SUPER ADMIN)
router.get('/organizers', getAllOrganizers);
router.get('/organizers/:organizerId/events', getEventsByOrganizer);
router.get('/organizers/:organizerId/guests', getGuestsByOrganizer);
router.get('/:eventId/guests', getGuestsByEvent);
router.get('/events', getAllEvents);

// DELETE (SUPER ADMIN)
router.delete('/events', deleteAllEvents);
router.delete('/events/:eventId', deleteEventById);
router.delete('/organizers/:organizerId/events', deleteEventsByOrganizer);
router.delete('/organizers/:organizerId', deleteOrganizer);
router.delete('/reset-all', resetAllData);


//POBLAR BASE DE DATOS
router.post('/seed', seedDatabase);

export default router;