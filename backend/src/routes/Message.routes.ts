import { Router } from 'express';
import { createMessage, getMessagesByEvent } from '../controller/Message.controller';
const router = Router();
router.post('/', createMessage);
router.get('/event/:eventId', getMessagesByEvent);
export default router;