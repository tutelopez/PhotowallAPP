import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, UserRole } from '../models/User.model';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1️⃣ Intentar obtener de x-admin-id
    let adminId = req.header('x-admin-id');

    // 2️⃣ Si no viene x-admin-id, intentar extraer del token JWT Bearer
    if (!adminId && req.headers.authorization?.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        adminId = decoded.userId || decoded.id;
      } catch (err) {
        // Si el token es inválido, seguiremos verificando abajo
      }
    }

    if (!adminId) {
      return res.status(401).json({
        message: 'Acceso no autorizado: se requiere token JWT de SuperAdmin o header x-admin-id'
      });
    }

    const admin = await UserModel.findById(adminId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Acceso solo para SuperAdmin'
      });
    }

    // Adjuntar admin al request
    (req as any).superAdmin = admin;
    (req as any).user = {
      id: admin._id.toString(),
      userId: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error validando SuperAdmin'
    });
  }
};
