import { UserRole } from '@shared/enums/user-role.enum';

export interface User {
  _id: string;
  name: string;
  email: string;

  /**
   * Solo se utilizará para el login o mientras trabajamos
   * con datos simulados (mocks). El backend normalmente
   * no devolverá este campo.
   */
  password?: string;

  role: UserRole;

  /**
   * Solo aplica para usuarios con rol GUEST.
   * Contiene el id del evento al que pertenece.
   */
  event?: string;

  createdAt: string;
  updatedAt: string;
}
