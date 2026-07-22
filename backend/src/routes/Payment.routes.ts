import { Router } from 'express';
import { createOrder, getPaymentStatus } from '../controller/Payment.controller';
import { ensureAuth } from '../middlewares/Auth.middlware';
import { UserRole } from '../models/User.model';
const router = Router();
router.post('/payments/create-order', ensureAuth([UserRole.ORGANIZER]), createOrder);
router.get('/payments/:orderId/status', ensureAuth([UserRole.ORGANIZER]), getPaymentStatus);

export default router;