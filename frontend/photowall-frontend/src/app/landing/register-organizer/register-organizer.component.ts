import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environments';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-organizer-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './register-organizer.component.html',
})
export class OrganizerRegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  register() {
    if (this.registerForm.invalid) return;

    this.http.post<any>(`${environment.apiUrl}/users/organizer`, this.registerForm.value)
      .subscribe({
        next: (res) => {
          this.snackBar.open(res.message || 'Registro exitoso', 'Cerrar', {
            duration: 4000,
            panelClass: ['snackbar-success'] // opcional: para estilos personalizados
          });
          this.registerForm.reset();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al registrar', 'Cerrar', {
            duration: 4000,
            panelClass: ['snackbar-error'] // opcional: para estilos personalizados
          });
        }
      });
  }
}
