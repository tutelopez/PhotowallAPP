import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-event-type-select',
  imports: [CommonModule, RouterModule],
  templateUrl: './event-type-select.component.html',
})
export class EventTypeSelectComponent {

  eventTypes = [
    { label: 'Boda', value: 'boda' },
    { label: 'Cumpleaños', value: 'cumpleaños' },
    { label: 'Aniversario', value: 'aniversario' },
    { label: 'Evento Empresarial', value: 'evento_empresarial' },
    { label: 'Baby Shower', value: 'babyshower' },
    { label: 'Bautizo', value: 'bautizo' },
    { label: 'Otro', value: 'otro' }
  ];

  constructor(private router: Router) {}

  selectType(type: string) {
    this.router.navigate(['/organizer/events/create', type]);
  }
}
