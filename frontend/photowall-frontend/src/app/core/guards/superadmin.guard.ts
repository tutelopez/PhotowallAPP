import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '@core/state/auth.state';

export const superAdminGuard: CanActivateFn = (_, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isAuthenticated() && authState.currentUser()?.role === 'super_admin') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
