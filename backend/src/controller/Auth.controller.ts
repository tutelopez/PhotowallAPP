import { NextFunction, Request, Response } from 'express';
import { UserModel, UserRole } from '../models/User.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const SALT_ROUNDS = 10;




// ------------------------
// REGISTRO DE ORGANIZER O GUEST (FORM LOGIN)
// ------------------------
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, eventId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email y password son obligatorios' });
    }

    // Validar rol
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Check si el usuario ya existe
    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Usuario ya registrado' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await UserModel.create({
      name,
      email,
      role,
      password: hashedPassword,
      event: eventId || undefined
    });

    res.status(201).json({ message: 'Usuario registrado correctamente', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registrando usuario' });
  }
};

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
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login exitoso', token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en login' });
  }
};


