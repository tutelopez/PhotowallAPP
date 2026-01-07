import { Component, OnInit } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UpperCasePipe,
    MatSnackBarModule
  ],
  templateUrl: './event-create.component.html',
})
export class EventCreateComponent implements OnInit {

  eventForm!: FormGroup;
  selectedType: string | null = null;

  profileImageFile: File | null = null;
  coverImageFile: File | null = null;

  user = JSON.parse(localStorage.getItem('user') || '{}');

  eventTypes = [
    { label: 'Boda', value: 'boda' },
    { label: 'Cumpleaños', value: 'cumpleaños' },
    { label: 'Aniversario', value: 'aniversario' },
    { label: 'Empresarial', value: 'evento_empresarial' },
    { label: 'Baby Shower', value: 'babyshower' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.selectedType = params.get('type');

      if (this.selectedType) {
        this.initForm();
      }
    });
  }

  initForm() {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  onProfileImageSelected(event: any) {
    this.profileImageFile = event.target.files[0];
  }

  onCoverImageSelected(event: any) {
    this.coverImageFile = event.target.files[0];
  }

  createEvent() {
    if (this.eventForm.invalid || !this.selectedType) return;

    const formData = new FormData();

    formData.append('name', this.eventForm.value.name);
    formData.append('date', this.eventForm.value.date);
    formData.append('type', this.selectedType);
    formData.append('organizerId', this.user._id);

    if (this.profileImageFile) {
      formData.append('profileImage', this.profileImageFile);
    }

    if (this.coverImageFile) {
      formData.append('coverImage', this.coverImageFile);
    }

    this.http.post(
      `${environment.apiUrl}/events`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    ).subscribe({
      next: () => {
        this.snackBar.open(
          'Evento creado exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
        window.location.href = '/organizer/dashboard';
      },
      error: err => {
        console.error(err);
        this.snackBar.open(
          'Error al crear el evento',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }
}
