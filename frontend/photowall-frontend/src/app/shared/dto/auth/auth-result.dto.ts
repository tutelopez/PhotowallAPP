import { User } from '../../models/User.model';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}
