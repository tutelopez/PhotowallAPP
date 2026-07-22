import { Router } from 'express';
import { authenticate } from '../middlewares/Auth.middlware';
import { authorizeRoles } from '../middlewares/Role.middleware';
import { ensureAuth } from '../middlewares/Auth.middlware';
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
      getAllPayments,
      getSystemStats,
      deleteAllEvents,
      resetAllData,
      seedDatabase 
    } from '../controller/Admin.controller';
import { UserRole } from '../models/User.model';
import { setEventPlan } from '../controller/Admin.controller';

const router = Router();


//crear superadmin
router.post('/super-admin', createSuperAdmin);

//proteger rutas
router.use(requireSuperAdmin);

// GET (SUPER ADMIN)
router.get('/stats', ensureAuth([UserRole.SUPER_ADMIN]), getSystemStats);
router.get('/payments', ensureAuth([UserRole.SUPER_ADMIN]), getAllPayments);
router.get('/organizers', ensureAuth([UserRole.SUPER_ADMIN]), getAllOrganizers);
router.get('/organizers/:organizerId/events', ensureAuth([UserRole.SUPER_ADMIN]), getEventsByOrganizer);
router.get('/organizers/:organizerId/guests', ensureAuth([UserRole.SUPER_ADMIN]), getGuestsByOrganizer);
router.get('/:eventId/guests', ensureAuth([UserRole.SUPER_ADMIN]), getGuestsByEvent);
router.get('/events', ensureAuth([UserRole.SUPER_ADMIN]),  getAllEvents);

// DELETE (SUPER ADMIN)
router.delete('/events', ensureAuth([UserRole.SUPER_ADMIN]), deleteAllEvents);
router.delete('/events/:eventId', ensureAuth([UserRole.SUPER_ADMIN]), deleteEventById);
router.delete('/organizers/:organizerId/events', ensureAuth([UserRole.SUPER_ADMIN]), deleteEventsByOrganizer);
router.delete('/organizers/:organizerId', ensureAuth([UserRole.SUPER_ADMIN]), deleteOrganizer);
router.delete('/reset-all', ensureAuth([UserRole.SUPER_ADMIN]), resetAllData);
router.patch('/events/:eventId/plan', ensureAuth([UserRole.SUPER_ADMIN]), setEventPlan);


//POBLAR BASE DE DATOS
router.post('/seed', ensureAuth([UserRole.SUPER_ADMIN]), seedDatabase);

export default router;