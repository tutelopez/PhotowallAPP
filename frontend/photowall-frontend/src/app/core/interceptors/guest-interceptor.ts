import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { GuestService } from '../services/guest';

export const guestInterceptor: HttpInterceptorFn = (req, next) => {
  const guestService = inject(GuestService);

  // Extract event slug from URL like /api/photos/event/:slug or /api/guests/join/:slug
  const slugMatch = req.url.match(/\/event\/([^/?]+)/);
  if (slugMatch) {
    const slug = slugMatch[1];
    const token = guestService.getTokenForSlug(slug);
    if (token) {
      const cloned = req.clone({
        setHeaders: { 'x-guest-token': token }
      });
      return next(cloned);
    }
  }

  return next(req);
};
