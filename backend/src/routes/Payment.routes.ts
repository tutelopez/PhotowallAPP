import { Router } from 'express';
import { createPaymentIntent, getPaymentStatus } from '../controller/Payment.controller';
import { ensureAuth } from '../middlewares/Auth.middlware';
import { UserRole } from '../models/User.model';
const router = Router();
router.post('/create-intent', ensureAuth([UserRole.ORGANIZER]), createPaymentIntent);
router.get('/:orderId/status', ensureAuth([UserRole.ORGANIZER]), getPaymentStatus);
export default router;