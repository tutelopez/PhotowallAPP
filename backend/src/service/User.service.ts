import { UserModel, UserRole } from '../models/User.model';
import bcrypt from 'bcrypt';

export const createOrganizer = async (data: { name: string; email: string; password: string }) => {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    throw new Error('name, email y password son obligatorios');
  }

  // Verificar si el email ya existe
  const exists = await UserModel.findOne({ email });
  if (exists) {
    throw new Error('El email ya está registrado');
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  return await UserModel.create({
    name,
    email,
    role: UserRole.ORGANIZER,
    password: hashedPassword
  });
};