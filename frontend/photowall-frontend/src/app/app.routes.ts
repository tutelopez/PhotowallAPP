import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then(m => m.RegisterComponent)
  },
  {
  path: 'forgot-password',
  loadComponent: () =>
    import('./features/auth/pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
},
{
  path: 'reset-password',
  loadComponent: () =>
    import('./features/auth/pages/reset-password/reset-password').then(m => m.ResetPasswordComponent)
},
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
  path: 'terminos',
  loadComponent: () =>
    import('./features/legal/pages/terms/terms').then(m => m.TermsComponent)
},
{
  path: 'privacidad',
  loadComponent: () =>
    import('./features/legal/pages/privacy/privacy').then(m => m.PrivacyComponent)
},
  {
  path: 'precios',
  loadComponent: () =>
    import('./features/pricing/pricing').then(m => m.PricingComponent)
},
{
  path: 'faqs',
  loadComponent: () =>
    import('./features/faqs/faqs').then(m => m.FaqsComponent)
},
{
  path: 'events/:id/payment-result',
  loadComponent: () =>
    import('./features/events/pages/payment-result/payment-result').then(m => m.PaymentResultComponent),
  canActivate: [authGuard]
},
  {
    path: 'events/new',
    loadComponent: () =>
      import('./features/events/pages/event-form/event-form').then(m => m.EventFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./features/events/pages/event-detail/event-detail').then(m => m.EventDetailComponent),
    canActivate: [authGuard]
  },
  {
    // Public guest view (accessed via QR)
    path: 'e/:slug',
    loadComponent: () =>
      import('./features/gallery/gallery').then(m => m.GalleryComponent)
  },
  {
    // Projection view (fullscreen for big screen)
    path: 'projection/:slug',
    loadComponent: () =>
      import('./features/projection/projection').then(m => m.ProjectionComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
