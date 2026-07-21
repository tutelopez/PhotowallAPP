import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 8,                   // máx. 8 intentos por IP en esa ventana
  standardHeaders: true,    // manda info en headers RateLimit-*
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.' }
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,                   // máx. 5 cuentas creadas por IP por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas cuentas creadas desde esta red. Intenta más tarde.' }
});