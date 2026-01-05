import { UserModel, UserRole } from '../models/User.model';

export const createOrganizer = async (data: any) => {
  return await UserModel.create({
    ...data,
    role: UserRole.ORGANIZER
  });
};
