import { Response, NextFunction } from 'express';
import { AuthRequest } from './Auth.middlware';
import { UserRole } from '../models/User.model';

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(403).json({ message: 'Usuario no autenticado' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    next();
  };
};
