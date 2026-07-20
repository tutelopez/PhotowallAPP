import cron from 'node-cron';
import { cleanupExpiredGalleries, sendExpirationReminders } from '../service/Cleanup.service';

export const startCleanupJob = () => {
  sendExpirationReminders().catch(err => console.error('🔴 Error en recordatorios iniciales:', err));
  cleanupExpiredGalleries().catch(err => console.error('🔴 Error en limpieza inicial:', err));
  cron.schedule('0 3 * * *', () => {
    console.log('🧹 Ejecutando limpieza y recordatorios programados...');
    sendExpirationReminders().catch(err => console.error('🔴 Error en recordatorios:', err));
    cleanupExpiredGalleries().catch(err => console.error('🔴 Error en limpieza:', err));
  });
  console.log('⏰ Job de limpieza y recordatorios programado (diario 3:00 AM)');
};



