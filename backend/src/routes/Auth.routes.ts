import { Router } from 'express';
import { registerUser, loginUser,googleAuth } from '../controller/Auth.controller';
import { requireAuth } from '../middlewares/Auth.middlware';

const router = Router();

// Registro
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Login con Google
router.post('/google', googleAuth);

export default router;
