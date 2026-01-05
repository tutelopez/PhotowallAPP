import { Router } from 'express';
import * as controller from '../controller/User.controller';

const router = Router();

router.post('/organizer', controller.createOrganizer);

export default router;
