import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../../../core/services/events';
import { PhotoWallEventType } from '../../../../shared/enums/event-type.enum';
@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="form-page">
      <div class="form-inner">
        <a routerLink="/dashboard" class="back-link">← Volver al dashboard</a>
        <h1 class="form-title">Crear nuevo evento</h1>
        <p class="form-sub">Completa los datos y obtendrás tu QR al instante</p>
        @if (error()) {
          <div class="form-error">{{ error() }}</div>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" class="event-form">
          <div class="field">
            <label>Nombre del evento</label>
            <input type="text" formControlName="name" placeholder="Boda de Ana y Luis">
          </div>
          <div class="field">
            <label>Fecha</label>
            <input type="date" formControlName="date">
          </div>
          <div class="field">
            <label>Tipo de evento</label>
            <select formControlName="type">
              <option value="">Selecciona un tipo</option>
              @for (t of eventTypes; track t.value) {
                <option [value]="t.value">{{ t.label }}</option>
              }
            </select>
          </div>
          <div class="field">
  <label>Imagen de portada</label>
  <input
    type="file"
    accept="image/*"
    (change)="onCoverSelected($event)">
</div>
<div class="field">
  <label>Imagen de perfil</label>
  <input
    type="file"
    accept="image/*"
    (change)="onProfileSelected($event)">
</div>
          <div class="form-actions">
            <a routerLink="/dashboard" class="btn-pw-ghost">Cancelar</a>
            <button type="submit" class="btn-pw-primary"
                    [disabled]="loading() || form.invalid">
              @if (loading()) { Creando… } @else { Crear evento y generar QR →}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page {
      min-height: 100vh; padding: 7rem 2rem 4rem;
      background: radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%), var(--pw-ink);
    }
    .form-inner { max-width: 560px; margin: 0 auto; }
    .back-link { color: rgba(248,247,255,0.5); font-size: 0.875rem; display: block; margin-bottom: 2rem; }
    .form-title { font-size: 2rem; margin-bottom: 0.5rem; }
    .form-sub { color: rgba(248,247,255,0.55); margin-bottom: 2.5rem; }
    .form-error {
      background: rgba(226,75,74,0.15); border: 1px solid rgba(226,75,74,0.35);
      border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.875rem; color: #f09595; margin-bottom: 1.5rem;
    }
    .field {
      margin-bottom: 1.5rem;
      label { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.4rem; color: rgba(248,247,255,0.75); }
      .optional { color: rgba(248,247,255,0.35); font-weight: 400; }
      input, select, textarea {
        width: 100%; background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
        padding: 0.75rem 1rem; color: #F8F7FF; font-size: 0.95rem;
        font-family: inherit; outline: none; transition: border-color 0.2s;
        &::placeholder { color: rgba(248,247,255,0.3); }
        &:focus { border-color: rgba(124,58,237,0.6); }
        option { background: #1A1A2E; color: #F8F7FF; }
      }
      textarea { resize: vertical; }
    }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
  `]
})
export class EventFormComponent {
  private fb     = inject(FormBuilder);
  private events = inject(EventsService);
  private router = inject(Router);
  coverImage?: File;
  profileImage?: File;
  loading = signal(false);
  error   = signal('');
 eventTypes: { value: PhotoWallEventType; label: string }[] = [
  {
    value: PhotoWallEventType.BODA,
    label: '💍 Boda'
  },
  {
    value: PhotoWallEventType.CUMPLEANOS,
    label: '🎂 Cumpleaños'
  },
  {
    value: PhotoWallEventType.ANIVERSARIO,
    label: '🎉 Aniversario'
  },
  {
    value: PhotoWallEventType.EMPRESARIAL,
    label: '💼 Evento empresarial'
  },
  {
    value: PhotoWallEventType.BABYSHOWER,
    label: '🍼 Baby Shower'
  },
  {
    value: PhotoWallEventType.BAUTIZO,
    label: '✝️ Bautizo'
  },
  {
    value: PhotoWallEventType.OTRO,
    label: '✨ Otro'
  }
];
  form = this.fb.nonNullable.group({
  name: ['', Validators.required],
  date: ['', Validators.required],
  type: [PhotoWallEventType.OTRO as PhotoWallEventType, Validators.required],
});
  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const dto = {
  ...this.form.getRawValue(),
  coverImage: this.coverImage,
  profileImage: this.profileImage
};
    this.events.createEvent(dto).subscribe({
    next: (response) => {
  this.router.navigate([
    '/events',
    response.event._id
  ]);
},
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al crear el evento');
        this.loading.set(false);
      }
    });
  }
onCoverSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  this.coverImage = input.files[0];
}
onProfileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  this.profileImage = input.files[0];
}
}
