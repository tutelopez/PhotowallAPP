import cron from 'node-cron';
import { cleanupExpiredGalleries } from '../service/Cleanup.service';

export const startCleanupJob = () => {
  // corre una vez al iniciar, por si el servidor estuvo apagado cuando algo venció
  cleanupExpiredGalleries().catch(err =>
    console.error('🔴 Error en limpieza inicial:', err)
  );
  // luego, todos los días a las 3:00 AM
  cron.schedule('0 3 * * *', () => {
    console.log('🧹 Ejecutando limpieza programada de galerías vencidas...');
    cleanupExpiredGalleries().catch(err =>
      console.error('🔴 Error en limpieza programada:', err)
    );
  });
  console.log('⏰ Job de limpieza de galerías programado (diario 3:00 AM)');
};