import { Router } from 'express';
import { createMessage, getMessagesByEvent, deleteMessage } from '../controller/Message.controller';
import { ensureAuth } from '../middlewares/Auth.middlware';
import { UserRole } from '../models/User.model';
const router = Router();
router.post('/', createMessage);
router.get('/event/:eventId', ensureAuth([UserRole.ORGANIZER]), getMessagesByEvent);
router.delete('/:messageId', ensureAuth([UserRole.ORGANIZER]), deleteMessage);
export default router;