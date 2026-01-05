import { Request, Response } from 'express';
import * as UserService from '../service/User.service';

export const createOrganizer = async (req: Request, res: Response) => {
  try {
    const user = await UserService.createOrganizer(req.body);

    // No devolvemos la contraseña
    const { password, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      message: 'Organizador creado correctamente',
      user: userWithoutPassword
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};