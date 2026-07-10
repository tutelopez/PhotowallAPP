import cloudinary from './cloudinary';
const requiredEnvs = [
  'MONGO_URI',
  'PORT',
  'CLOUDINARY_URL',
  'SUPER_ADMIN_SECRET',
  'NODE_ENV',
  'JWT_SECRET'
];
export const checkEnv = async () => {
  console.log('🔍 Verificando variables de entorno...');
  const missing = requiredEnvs.filter(env => !process.env[env]);
  if (missing.length) {
    console.error('❌ Variables de entorno faltantes:', missing);
    process.exit(1);
  }
  console.log('✅ Variables de entorno cargadas');
  try {
    console.log('☁️ Verificando conexión con Cloudinary...');
    const result = await cloudinary.api.ping();
    if (result.status !== 'ok') {
      throw new Error('Cloudinary ping falló');
    }
    console.log('✅ Cloudinary conectado correctamente');
  } catch (error) {
    console.error('❌ Error conectando a Cloudinary');
    console.error(error);
    process.exit(1);
  }
};