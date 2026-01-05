import { Router } from 'express';
import { joinEvent } from '../controller/Guest.controller';

const router = Router();

router.post('/join/:slug', joinEvent);

export default router;
