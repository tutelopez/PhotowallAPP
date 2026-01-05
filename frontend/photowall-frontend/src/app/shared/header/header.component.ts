import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../../core/user.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // 👈 IMPORTAR RouterModule

@Component({
  selector: 'app-header-nav',
  templateUrl: './header.component.html',
  imports: [CommonModule, RouterModule]
})
export class HeaderNavComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;
  }


  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.user = null;
    window.location.href = '/login-organizer';

  }
}
