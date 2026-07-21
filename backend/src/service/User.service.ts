import { UserModel, UserRole } from '../models/User.model';
import bcrypt from 'bcrypt';
import { GoogleProfile } from '../utils/googleAuth';
import crypto from 'crypto';

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

export const requestPasswordReset = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) return null;
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  await user.save();
  return { user, rawToken };
};

export const resetPassword = async (rawToken: string, newPassword: string) => {
  if (!newPassword || newPassword.length < 6) {
    const err: any = new Error('La contraseña debe tener al menos 6 caracteres');
    err.status = 400;
    throw err;
  }
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });
  if (!user) {
    const err: any = new Error('El enlace es inválido o ya expiró');
    err.status = 400;
    throw err;
  }
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  return user;
};