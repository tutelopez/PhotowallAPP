import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/google'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => req.url.includes(endpoint));
      // Solo forzamos logout si YA teníamos token (sesión activa) y el 401
      // no vino del propio login/register (ahí un 401 es "contraseña incorrecta", no sesión vencida)
      if (error.status === 401 && token && !isAuthEndpoint) {
        authService.forceLogout();
      }
      return throwError(() => error);
    })
  );
};
