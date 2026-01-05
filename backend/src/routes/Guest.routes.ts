// routes/guest.route.ts
import { Router } from 'express';
import { joinEventById } from '../controller/Guest.controller';

const router = Router();

// ahora el invitado se une por ID de evento
router.post('/join/:eventId', joinEventById);

export default router;
