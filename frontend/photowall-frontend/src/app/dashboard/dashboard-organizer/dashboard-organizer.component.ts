import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';

interface Event {
  _id: string;
  name: string;
  date: string;
  coverImage?: string;
  profileImage?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard-organizer',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard-organizer.component.html'
})
export class DashboardOrganizerComponent implements OnInit {

  user: User | null = null;
  events: Event[] = [];

  defaultCover = 'https://res.cloudinary.com/demo/image/upload/v1690000000/event-cover-default.jpg';
  defaultProfile = 'https://res.cloudinary.com/demo/image/upload/v1690000000/event-profile-default.png';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.loadEvents();
    } else {
      this.router.navigate(['/organizer/login']);
    }
  }

  loadEvents() {
    if (!this.user) return;

    this.http.get<Event[]>(
      `${environment.apiUrl}/events/organizer/${this.user._id}`
    ).subscribe({
      next: (res) => this.events = res,
      error: (err) => console.error('Error cargando eventos', err)
    });
  }

  manageEvent(eventId: string) {
  this.router.navigate(['/organizer/events', eventId, 'manage']);
}


  createEvent() {
    this.router.navigate(['/organizer/create-event']);
  }
}
