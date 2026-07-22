import { Router } from 'express';
import { createOrder, captureOrder, getPaymentStatus } from '../controller/Payment.controller';
import { ensureAuth } from '../middlewares/Auth.middlware';
import { UserRole } from '../models/User.model';

const router = Router();

router.post('/create-order', ensureAuth([UserRole.ORGANIZER]), createOrder);
router.post('/:orderId/capture', ensureAuth([UserRole.ORGANIZER]), captureOrder);
router.get('/:orderId/status', ensureAuth([UserRole.ORGANIZER]), getPaymentStatus);

export default router;