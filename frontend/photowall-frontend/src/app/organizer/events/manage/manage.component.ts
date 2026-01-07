import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.scss'
})
export class ManageComponent implements OnInit {

  eventId!: string;

  event: any = {};
  guests: any[] = [];
  photos: any[] = [];

  showGuests = false;

  defaultCover = '/assets/default-cover.jpg';
  defaultProfile = '/assets/default-profile.jpg';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    const eventId = this.route.snapshot.paramMap.get('eventId');
    console.log('EVENT ID:', eventId);
    this.loadEvent();
  }

  loadEvent() {
    this.http.get<any>(
      `${environment.apiUrl}/events/${this.eventId}/manage`
    ).subscribe({
      next: (res) => {
        this.event = res.event;
        this.guests = res.guests.list;
        this.photos = res.photos;
      },
      error: (err) => {
        console.error('Error cargando evento', err);
      }
    });
  }

  toggleGuests() {
    this.showGuests = !this.showGuests;
  }

  shareQr() {
    if (!this.event.qrCode) return;

    // Abrir QR en nueva pestaña
    const win = window.open();
    win?.document.write(`
      <img src="${this.event.qrCode}" style="width:300px"/>
    `);
  }

  editEvent() {
    this.router.navigate(['/events', this.eventId, 'edit']);
  }

  goToProjection() {
    this.router.navigate(['/events', this.eventId, 'projection']);
  }
}
