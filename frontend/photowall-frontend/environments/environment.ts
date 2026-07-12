export const environment = {
  production: false,
  apiUrl: '/api',
  // Vacío = mismo origen que la app (usa el proxy de /socket.io en dev,
  // o el mismo dominio detrás de tu reverse proxy en producción).
  socketUrl: '',
  appName: 'PhotoWall'
};
