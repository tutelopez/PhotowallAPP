import { UserModel, UserRole } from '../models/User.model';
import bcrypt from 'bcrypt';
import { GoogleProfile } from '../utils/googleAuth';

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

export const findOrCreateGoogleOrganizer = async (profile: GoogleProfile) => {
  let user = await UserModel.findOne({
    $or: [{ googleId: profile.googleId }, { email: profile.email }]
  });

  if (user) {
    // Cuenta existente creada con email/password: la vinculamos a Google
    if (!user.googleId) {
      user.googleId = profile.googleId;
      user.authProvider = 'google';
      await user.save();
    }
    return user;
  }

  return UserModel.create({
    name: profile.name,
    email: profile.email,
    role: UserRole.ORGANIZER,
    googleId: profile.googleId,
    authProvider: 'google'
  });
};