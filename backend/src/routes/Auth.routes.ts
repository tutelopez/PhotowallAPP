import { Router } from 'express';
import { registerUser, loginUser } from '../controller/Auth.controller';
import { requireAuth } from '../middlewares/Auth.middlware';

const router = Router();

// Registro
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);



export default router;
