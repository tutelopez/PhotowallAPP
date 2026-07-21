import { Router } from 'express';
import { registerUser, loginUser,googleAuth, forgotPassword, resetPassword } from '../controller/Auth.controller';
import { requireAuth } from '../middlewares/Auth.middlware';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter'; // 👈 nuevo

const router = Router();

// Registro
router.post('/register',registerLimiter, registerUser);

// Login
router.post('/login', loginLimiter, loginUser);

// Login con Google
router.post('/google', googleAuth);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
export default router;
