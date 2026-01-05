import { Request, Response, NextFunction } from 'express';
import { UserModel, UserRole } from '../models/User.model';

export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // adminId enviado por header (RECOMENDADO)
    const adminId = req.header('x-admin-id');

    if (!adminId) {
      return res.status(401).json({
        message: 'adminId es requerido'
      });
    }

    const admin = await UserModel.findById(adminId);

    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Acceso solo para SuperAdmin'
      });
    }

    // opcional: adjuntar admin al request
    req.superAdmin = admin;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error validando SuperAdmin'
    });
  }
};
