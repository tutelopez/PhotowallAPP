import { Router } from 'express';
import * as controller from '../controller/Event.controller';
import * as EventController from '../controller/Event.controller';
import * as GuestController from '../controller/Guest.controller';
import { ensureAuth } from '../middlewares/Auth.middlware';
import { UserRole } from '../models/User.model';
import { getEventManageData } from '../controller/Event.controller';
import { upload } from '../config/multer';

const router = Router();
router.post(
  '/',
  ensureAuth([UserRole.ORGANIZER]),
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
  ]),
  controller.create
);

router.get(
  '/my-events',
  ensureAuth([UserRole.ORGANIZER]),
  EventController.getMyEvents
);

// 🔐 SOLO ORGANIZADOR (ANTES del slug)
router.get(
  '/:eventId/manage',
  ensureAuth([UserRole.ORGANIZER]),
  getEventManageData
);

router.get(
  '/:eventId/organizer/:organizerId',
  EventController.getEventDetail
);

router.patch(
  '/:eventId/messages-toggle',
  ensureAuth([UserRole.ORGANIZER]),
  EventController.toggleMessages
);

router.patch('/:eventId/request-plan-upgrade', ensureAuth([UserRole.ORGANIZER]), EventController.requestPlanUpgrade);

router.patch('/:eventId/branding', ensureAuth([UserRole.ORGANIZER]), EventController.updateBranding);

router.patch('/:eventId/cancel-pending-plan', ensureAuth([UserRole.ORGANIZER]), EventController.cancelPendingPlan);

router.patch('/:eventId/regenerate-qr', ensureAuth([UserRole.ORGANIZER]), EventController.regenerateQR);

router.patch('/:eventId/guests/:guestId/disable', ensureAuth([UserRole.ORGANIZER]), GuestController.disableGuest);

// ⚠️ SIEMPRE AL FINAL
router.get('/:slug', controller.getBySlug);

router.put(
  '/:eventId',
  ensureAuth([UserRole.ORGANIZER]),
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
  ]),
  controller.update
);

export default router;
