import cloudinary from './cloudinary';
const requiredEnvs = [
  'MONGO_URI',
  'PORT',
  'CLOUDINARY_URL',
  'SUPER_ADMIN_SECRET',
  'NODE_ENV',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM_NAME',
  'FRONTEND_URL',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_BASE_URL',
  'PAYPAL_WEBHOOK_ID'
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