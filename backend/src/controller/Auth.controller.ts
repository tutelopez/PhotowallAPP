import { NextFunction, Request, Response } from 'express';
import { UserModel, UserRole } from '../models/User.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as UserService from '../service/User.service';
import { sendWelcomeEmail } from '../service/Email.service';
import { generateToken } from '../utils/jwt';

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


