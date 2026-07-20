import { Injectable, inject } from '@angular/core';
import { User } from '../../shared/models/User.model';
import { LoginDto } from '../../shared/dto/auth/login.dto';
import { RegisterDto } from '../../shared/dto/auth/register.dto';
import { AuthResult } from '../../shared/dto/auth/auth-result.dto';
import { UserRole } from '../../shared/enums/user-role.enum';
import { LocalStorageService } from '../storage/local-storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuthState } from '@core/state/auth.state';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly storage = inject(LocalStorageService);

  private readonly authState = inject(AuthState);

  private http = inject(HttpClient);

  private router = inject(Router);

  private base = `${environment.apiUrl}/auth`;


  constructor() {

  }

 login(dto: LoginDto): Observable<AuthResult> {

  return this.http.post<any>(
    `${this.base}/login`,
    dto
  ).pipe(

    tap(res => {

      this.authState.setUser(res.user);

      this.storage.set(STORAGE_KEYS.USER, res.user);

      this.storage.set(STORAGE_KEYS.TOKEN, res.token);

    }),

    map(res => ({

      success: true,

      message: res.message,

      user: res.user

    }))

  );

}

register(dto: RegisterDto) {

  return this.http.post<any>(
    `${this.base}/register`,
    {

      ...dto,

      role: UserRole.ORGANIZER

    }

  );

}

  logout(): void {

    this.authState.clear();

    this.storage.remove(STORAGE_KEYS.USER);
    this.storage.remove(STORAGE_KEYS.TOKEN);
    this.router.navigate(['/']);
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

loginWithGoogle(credential: string): Observable<AuthResult> {
  return this.http.post<any>(`${this.base}/google`, { credential }).pipe(
    tap(res => {
      this.authState.setUser(res.user);
      this.storage.set(STORAGE_KEYS.USER, res.user);
      this.storage.set(STORAGE_KEYS.TOKEN, res.token);
    }),
    map(res => ({
      success: true,
      message: res.message,
      user: res.user
    }))
  );
}

}
