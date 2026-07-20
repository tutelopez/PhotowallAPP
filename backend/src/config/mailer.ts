import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log('📧 Servidor de correo conectado correctamente');
  } catch (err) {
    console.warn('⚠️ No se pudo conectar al servidor de correo (revisa SMTP_* en .env):', err);
  }
};