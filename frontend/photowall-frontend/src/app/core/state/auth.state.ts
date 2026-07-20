import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../../shared/models/User.model';
import { LocalStorageService } from '../storage/local-storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class AuthState {
  private readonly storage = inject(LocalStorageService);
  private readonly userSignal = signal<User | null>(this.getInitialUser());

  readonly currentUser = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  private getInitialUser(): User | null {
    const token = this.storage.get<string>(STORAGE_KEYS.TOKEN);
    const user = this.storage.get<User>(STORAGE_KEYS.USER);
    // Solo se restaura la sesión si existen AMBOS: token y datos de usuario
    return token && user ? user : null;
  }

  setUser(user: User | null): void {
    this.userSignal.set(user);
  }
  clear(): void {
    this.userSignal.set(null);
  }
}
