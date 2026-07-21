import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo"><span style="color:#F472B6">●</span> PhotoWall</div>
        <h1 class="auth-title">Crea una nueva contraseña</h1>
        <p class="auth-sub">Elige una contraseña segura para tu cuenta</p>
        @if (!token()) {
          <div class="auth-error">Este enlace no es válido. Solicita uno nuevo.</div>
        } @else if (done()) {
          <div class="auth-success">¡Tu contraseña se actualizó correctamente!</div>
          <a routerLink="/login" class="btn-pw-primary w-full" style="margin-top:1rem; text-align:center; display:block;">Iniciar sesión</a>
        } @else {
          @if (error()) { <div class="auth-error">{{ error() }}</div> }
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="password">Nueva contraseña</label>
              <input id="password" type="password" formControlName="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
            </div>
            <button type="submit" class="btn-pw-primary w-full" [disabled]="loading() || form.invalid">
              @if (loading()) { Guardando… } @else { Guardar nueva contraseña }
            </button>
          </form>
        }
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
  `]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  token = signal<string | null>(null);
  loading = signal(false);
  done = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  ngOnInit() {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
  }
  submit() {
    if (this.form.invalid || !this.token()) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.resetPassword(this.token()!, this.form.getRawValue().password).subscribe({
      next: () => { this.loading.set(false); this.done.set(true); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Error restableciendo la contraseña');
      }
    });
  }
}
