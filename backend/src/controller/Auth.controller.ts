import { NextFunction, Request, Response } from 'express';
import { UserModel, UserRole } from '../models/User.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as UserService from '../service/User.service';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../service/Email.service';
import { generateToken } from '../utils/jwt';
import { verifyGoogleToken } from '../utils/googleAuth'; // 👈 nuevo

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const SALT_ROUNDS = 10;




// ------------------------
// REGISTRO DE ORGANIZER O GUEST (FORM LOGIN)
// ------------------------

export const registerUser = async (req: Request, res: Response) => {

   const user = await UserService.createOrganizer(req.body);

   const token = generateToken({
  userId: user._id,
  role: user.role
});

   res.status(201).json({
      user,
      token
   });
sendWelcomeEmail({ name: user.name, email: user.email });
}
// ------------------------
// LOGIN DE ORGANIZER O GUEST (FORM LOGIN)
// ------------------------
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email y password son obligatorios' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (!user.password) {
      return res.status(400).json({ message: 'Usuario registrado sin password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Generar JWT
    const token = generateToken({
  userId: user._id,
  role: user.role
});

    res.json({ message: 'Login exitoso', token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en login' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'credential es obligatorio' });
    }

    const profile = await verifyGoogleToken(credential);
    if (!profile.emailVerified) {
      return res.status(401).json({ message: 'El email de Google no está verificado' });
    }

    const isNewUser = !(await UserModel.exists({
      $or: [{ googleId: profile.googleId }, { email: profile.email }]
    }));

    const user = await UserService.findOrCreateGoogleOrganizer(profile);
    const token = generateToken({ userId: user._id, role: user.role });

    if (isNewUser) {
      sendWelcomeEmail({ name: user.name, email: user.email });
    }

    res.json({ message: 'Login con Google exitoso', token, user });
  } catch (error: any) {
    console.error('🔴 ERROR GOOGLE AUTH:', error);
    res.status(401).json({ message: error.message || 'Error autenticando con Google' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'El correo es obligatorio' });
    const result = await UserService.requestPasswordReset(email);
    res.json({ message: 'Si el correo existe en nuestro sistema, enviamos un enlace de recuperación' });
    if (result) {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${result.rawToken}`;
      sendPasswordResetEmail({ name: result.user.name, email: result.user.email }, resetUrl);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error procesando la solicitud' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'token y password son obligatorios' });
    }
    await UserService.resetPassword(token, password);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error: any) {
    res.status(error.status || 400).json({ message: error.message || 'Error restableciendo la contraseña' });
  }
};