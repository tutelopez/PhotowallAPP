export const environment = {
  production: false,
  apiUrl: '/api',
  // Vacío = mismo origen que la app (usa el proxy de /socket.io en dev,
  // o el mismo dominio detrás de tu reverse proxy en producción).
  socketUrl: '',
  appName: 'PhotoWall',
  googleClientId: '339580540642-ge7hqg7mc1j3al4ts8ndmtn5sff0a855.apps.googleusercontent.com'

};
