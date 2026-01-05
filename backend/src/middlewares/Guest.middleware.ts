import { Request, Response, NextFunction } from 'express';
import { GuestModel } from '../models/Guest.model';

export const identifyGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers['x-guest-token'] as string;

  if (!token) {
    return res.status(401).json({
      message: 'Invitado no identificado'
    });
  }

  const guest = await GuestModel.findOne({
    token,
    isActive: true
  });

  if (!guest) {
    return res.status(401).json({
      message: 'Sesión de invitado inválida'
    });
  }

  req.guest = guest; // tipado luego
  next();
};
