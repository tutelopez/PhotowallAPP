import { Injectable, inject } from '@angular/core';

import { User } from '../../shared/models/User.model';
import { LoginDto } from '../../shared/dto/auth/login.dto';
import { RegisterDto } from '../../shared/dto/auth/register.dto';
import { AuthResult } from '../../shared/dto/auth/auth-result.dto';

import { UserRole } from '../../shared/enums/user-role.enum';

import { USERS_MOCK } from '../mocks/user.mock';
import { LocalStorageService } from '../storage/local-storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuthState } from '@core/state/auth.state';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly storage = inject(LocalStorageService);

private readonly authState = inject(AuthState);


  constructor() {
    this.restoreSession();
  }

  login(dto: LoginDto): AuthResult {

  const user = USERS_MOCK.find(
    u =>
      u.email === dto.email &&
      u.password === dto.password
  );

  if (!user) {
    return {
      success: false,
      message: 'Correo o contraseña incorrectos.'
    };
  }

  this.authState.setUser(user);

  this.storage.set(STORAGE_KEYS.USER, user);
  this.storage.set(STORAGE_KEYS.TOKEN, 'mock-token');

  return {
    success: true,
    message: 'Inicio de sesión exitoso.',
    user
  };
}

  register(dto: RegisterDto): User {

    const newUser: User = {
      _id: crypto.randomUUID(),
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: UserRole.ORGANIZER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    USERS_MOCK.push(newUser);

    return newUser;
  }

  logout(): void {

    this.authState.clear();

    this.storage.remove(STORAGE_KEYS.USER);
    this.storage.remove(STORAGE_KEYS.TOKEN);

  }

  private restoreSession(): void {

    const user = this.storage.get<User>(STORAGE_KEYS.USER);

    if (user) {
    this.authState.setUser(user);
    }

  }
getCurrentUser(): User | null {
  return this.authState.currentUser();
}

hasRole(role: UserRole): boolean {
  return this.authState.currentUser()?.role === role;
}

isAuthenticated(): boolean {
  return this.authState.isAuthenticated();
}
getToken(): string | null {
  return this.storage.get<string>(STORAGE_KEYS.TOKEN);
}

}
