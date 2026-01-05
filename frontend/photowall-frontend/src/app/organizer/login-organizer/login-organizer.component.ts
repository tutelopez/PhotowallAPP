import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-login-organizer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MatSnackBarModule, RouterModule],
  templateUrl: './login-organizer.component.html',
  styleUrls: ['./login-organizer.component.scss']
})
export class LoginOrganizerComponent {
  loginForm: FormGroup;
   message: string = '';
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) return;

    this.http.post<any>(`${environment.apiUrl}/auth/login`, this.loginForm.value)
      .subscribe({
        next: (res) => {
          // Guardar token y usuario en localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          // Mostrar mensaje de éxito
          this.snackBar.open('Login exitoso', 'Cerrar', { duration: 3000 });

          // Redirigir al dashboard
          window.location.href = '/dashboard-organizer';
        },
        error: (err) => {
          this.message = err.error?.message || 'Error al iniciar sesión';
          this.snackBar.open(this.message, 'Cerrar', { duration: 3000 });
        }
      });
  }
}
