import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo"><span style="color:#F472B6">●</span> PhotoWall</div>
        <h1 class="auth-title">Recupera tu contraseña</h1>
        <p class="auth-sub">Te enviaremos un enlace para restablecerla</p>
        @if (sent()) {
          <div class="auth-success">
            Si el correo existe en nuestro sistema, te enviamos un enlace de recuperación. Revisa tu bandeja (y spam).
          </div>
        } @else {
          @if (error()) { <div class="auth-error">{{ error() }}</div> }
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="email">Correo electrónico</label>
              <input id="email" type="email" formControlName="email" placeholder="tu@email.com" autocomplete="email">
            </div>
            <button type="submit" class="btn-pw-primary w-full" [disabled]="loading() || form.invalid">
              @if (loading()) { Enviando… } @else { Enviar enlace }
            </button>
          </form>
        }
        <p class="auth-footer">
          <a routerLink="/login">Volver a iniciar sesión</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem;
      background: radial-gradient(ellipse at top, rgba(124,58,237,0.12) 0%, transparent 60%), var(--pw-ink); }
    .auth-card { width:100%; max-width:420px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.10); border-radius:20px; padding:2.5rem; }
    .auth-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.1rem; margin-bottom:2rem; }
    .auth-title { font-size:1.75rem; margin-bottom:0.5rem; }
    .auth-sub { color:rgba(248,247,255,0.55); margin-bottom:2rem; font-size:0.95rem; }
    .auth-error { background:rgba(226,75,74,0.15); border:1px solid rgba(226,75,74,0.35); border-radius:10px; padding:0.75rem 1rem; font-size:0.875rem; color:#f09595; margin-bottom:1.5rem; }
    .auth-success { background:rgba(93,202,165,0.15); border:1px solid rgba(93,202,165,0.35); border-radius:10px; padding:0.9rem 1rem; font-size:0.875rem; color:#5dcaa5; }
    .field { margin-bottom:1.25rem;
      label { display:block; font-size:0.85rem; font-weight:500; margin-bottom:0.4rem; color:rgba(248,247,255,0.75); }
      input { width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:0.75rem 1rem; color:#F8F7FF; font-size:0.95rem; outline:none; transition:border-color 0.2s;
        &::placeholder { color:rgba(248,247,255,0.3); } &:focus { border-color:rgba(124,58,237,0.6); } }
    }
    .w-full { width:100%; justify-content:center; margin-top:0.5rem; }
    .auth-footer { text-align:center; margin-top:1.5rem; font-size:0.875rem; color:rgba(248,247,255,0.5);
      a { color:#A78BFA; } }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  loading = signal(false);
  sent = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });
  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Error enviando el enlace');
      }
    });
  }
}
