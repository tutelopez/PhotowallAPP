import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, UserRole } from '../models/User.model';

export interface AuthRequest extends Request {
  user?: any;
}
interface JwtPayload {
  userId: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token requerido' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware de autorización
export const ensureAuth = (allowedRoles?: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // El token se envía en el header: Authorization: Bearer <token>
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: 'Token faltante' });

      const token = authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Token inválido' });

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole };
      req.user = decoded;

      // Validar roles permitidos
      if (allowedRoles && !allowedRoles.includes(decoded.role as UserRole)) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  };
};


export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token faltante' });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no definido en .env');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // Buscar el usuario en la base de datos
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Adjuntar info del usuario a la request para usar en los controllers
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error: any) {
    console.error(error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};