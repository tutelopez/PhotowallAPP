import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import readline from 'readline';
import { UserModel, UserRole } from '../models/User.model';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('🔴 ERROR: No se encontró MONGO_URI en el archivo .env');
      process.exit(1);
    }

    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB.\n');

    console.log('👑 --- CREACIÓN DE CUENTA SUPERADMIN --- 👑');
    const name = await question('Nombre del SuperAdmin: ');
    const email = await question('Correo electrónico: ');
    const password = await question('Contraseña segura: ');

    if (!name || !email || !password) {
      console.error('🔴 ERROR: Todos los campos son obligatorios.');
      process.exit(1);
    }

    const existingUser = await UserModel.findOne({ email: email.trim() });
    if (existingUser) {
      if (existingUser.role === UserRole.SUPER_ADMIN) {
        console.log(`⚠️ El correo ${email} ya existe y YA es SuperAdmin.`);
        const reset = await question('¿Deseas actualizar su contraseña? (y/N): ');
        if (reset.trim().toLowerCase() === 'y') {
          existingUser.password = await bcrypt.hash(password, 10);
          await existingUser.save();
          console.log('✅ Contraseña de SuperAdmin actualizada con éxito.');
        }
      } else {
        console.log(`⚠️ El correo ${email} ya existe como ${existingUser.role}. Elevando a SUPER_ADMIN...`);
        existingUser.role = UserRole.SUPER_ADMIN;
        existingUser.password = await bcrypt.hash(password, 10);
        await existingUser.save();
        console.log('✅ Usuario elevado a SuperAdmin y contraseña actualizada con éxito.');
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await UserModel.create({
        name: name.trim(),
        email: email.trim(),
        role: UserRole.SUPER_ADMIN,
        password: hashedPassword
      });
      console.log(`✅ ¡SuperAdmin creado exitosamente para: ${email.trim()}!`);
    }

  } catch (error) {
    console.error('🔴 Error fatal al crear SuperAdmin:', error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
