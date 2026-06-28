import { Injectable, computed, signal } from '@angular/core';
import { User } from '../../shared/models/User.model';

@Injectable({
  providedIn: 'root'
})
export class AuthState {

  private readonly userSignal = signal<User | null>(null);

  readonly currentUser = computed(() => this.userSignal());

  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  setUser(user: User | null): void {
    this.userSignal.set(user);
  }

  clear(): void {
    this.userSignal.set(null);
  }
}
