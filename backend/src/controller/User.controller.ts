import { Request, Response } from 'express';
import * as UserService from '../service/User.service';

export const createOrganizer = async (req: Request, res: Response) => {
  const user = await UserService.createOrganizer(req.body);
  res.status(201).json(user);
};
