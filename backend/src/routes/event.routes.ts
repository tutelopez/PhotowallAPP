import { Router } from 'express';
import * as controller from '../controller/Event.controller';
import * as EventController from '../controller/Event.controller';
import { ensureAuth } from '../middlewares/Auth.middlware';
import { UserRole } from '../models/User.model';

const router = Router();

router.post('/',ensureAuth([UserRole.ORGANIZER]), controller.create);
router.get('/:slug', controller.getBySlug);
router.get('/organizer/:organizerId', EventController.getMyEvents);
router.get(
  '/:eventId/organizer/:organizerId',
  EventController.getEventDetail
);

export default router;
