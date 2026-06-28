import { User } from '@shared/models/User.model';
import { UserRole } from '@shared/enums/user-role.enum';

export const USERS_MOCK: User[] = [
  {
    _id: '1',
    name: 'Mateo López',
    email: 'mateo@photowall.com',
    password: '123456',
    role: UserRole.ORGANIZER,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Administrador',
    email: 'admin@photowall.com',
    password: 'admin123',
    role: UserRole.SUPER_ADMIN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
