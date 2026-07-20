import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleSigninButtonComponent } from '../../../../shared/components/google-signin-button/google-signin-button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleSigninButtonComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span style="color:#F472B6">●</span> PhotoWall
        </div>
        <h1 class="auth-title">Bienvenido de vuelta</h1>
        <p class="auth-sub">Inicia sesión para gestionar tus eventos</p>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label for="email">Correo electrónico</label>
            <input id="email" type="email" formControlName="email"
                   placeholder="tu@email.com" autocomplete="email">
          </div>
          <div class="field">
            <label for="password">Contraseña</label>
            <input id="password" type="password" formControlName="password"
                   placeholder="••••••••" autocomplete="current-password">
          </div>

        <button type="submit" class="btn-pw-primary w-full"
        [disabled]="loading() || form.invalid">
  @if (loading()) {
    <span class="pw-spinner-sm"></span> Entrando…
  } @else {
    Iniciar sesión
  }
</button>

        </form>

        <div class="auth-divider"><span>o continúa con</span></div>
        @if (loading()) {
  <div class="google-btn-loading">
    <span class="pw-spinner-sm"></span> Conectando con Google…
  </div>
} @else {
  <app-google-signin-button (credential)="onGoogleCredential($event)"></app-google-signin-button>
}
        <p class="auth-footer">
          ¿No tienes cuenta?
          <a routerLink="/register">Regístrate gratis</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      background: radial-gradient(ellipse at top, rgba(124,58,237,0.12) 0%, transparent 60%),
                  var(--pw-ink);
    }
    .auth-card {
      width: 100%; max-width: 420px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 20px;
      padding: 2.5rem;
    }
    .auth-logo {
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 1.1rem;
      margin-bottom: 2rem;
    }
    .auth-title { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .auth-sub { color: rgba(248,247,255,0.55); margin-bottom: 2rem; font-size: 0.95rem; }
    .auth-error {
      background: rgba(226,75,74,0.15);
      border: 1px solid rgba(226,75,74,0.35);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: #f09595;
      margin-bottom: 1.5rem;
    }
    .field {
      margin-bottom: 1.25rem;
      label { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.4rem; color: rgba(248,247,255,0.75); }
      input {
        width: 100%;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 0.75rem 1rem;
        color: #F8F7FF;
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.2s;
        &::placeholder { color: rgba(248,247,255,0.3); }
        &:focus { border-color: rgba(124,58,237,0.6); }
      }
    }
    .w-full { width: 100%; justify-content: center; margin-top: 0.5rem; }
    .auth-footer {
      text-align: center; margin-top: 1.5rem; font-size: 0.875rem;
      color: rgba(248,247,255,0.5);
      a { color: #A78BFA; margin-left: 0.25rem; }
    }
    .auth-divider {
      display: flex; align-items: center; gap: 0.75rem;
      margin: 1.5rem 0;
      color: rgba(248,247,255,0.4); font-size: 0.8rem;
    }
    .auth-divider::before, .auth-divider::after {
      content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.12);
    }
    .google-btn-loading {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  height: 40px; /* misma altura aprox. que el botón de Google (size: large) */
  color: rgba(248,247,255,0.65);
  font-size: 0.9rem;
}
  `]
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error   = signal('');

  form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

submit() {

  if (this.form.invalid) return;

  this.loading.set(true);

  this.error.set('');

  this.auth.login(this.form.getRawValue())
    .subscribe({

      next: () => {

        this.router.navigate(['/dashboard']);

      },

      error: err => {

        this.error.set(
          err.error?.message ??
          'Error al iniciar sesión'
        );

        this.loading.set(false);

      },

      complete: () => {

        this.loading.set(false);

      }

    });

}

onGoogleCredential(credential: string) {
    this.loading.set(true);
    this.error.set('');
    this.auth.loginWithGoogle(credential).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error.set(err.error?.message ?? 'Error al iniciar sesión con Google');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

}
