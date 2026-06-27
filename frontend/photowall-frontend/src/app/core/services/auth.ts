import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../../shared/models/index';

const TOKEN_KEY = 'pw_auth_token';
const USER_KEY  = 'pw_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private base   = `${environment.apiUrl}/auth`;

  // ── Signals ──────────────────────────────────────────────────────────────
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user  = signal<User | null>(this.parseUser());

  readonly token      = this._token.asReadonly();
  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._token());

  // ── Auth actions ─────────────────────────────────────────────────────────

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap(res => this.persist(res))
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload).pipe(
      tap(res => this.persist(res))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/']);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private persist(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._user.set(res.user);
  }

  private parseUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
