import { Router } from 'express';
import * as controller from '../controller/Event.controller';
import * as EventController from '../controller/Event.controller';
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

router.get('/organizer/:organizerId', EventController.getMyEvents);

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
