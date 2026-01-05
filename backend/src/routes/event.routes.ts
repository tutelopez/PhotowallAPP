import { Router } from 'express';
import * as controller from '../controller/Event.controller';
import * as EventController from '../controller/Event.controller';

const router = Router();

router.post('/', controller.create);
router.get('/:slug', controller.getBySlug);
router.get('/organizer/:organizerId', EventController.getMyEvents);
router.get(
  '/:eventId/organizer/:organizerId',
  EventController.getEventDetail
);

export default router;
