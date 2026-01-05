import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing/landing.component';
import { OrganizerRegisterComponent } from './landing/register-organizer/register-organizer.component';
import { LoginOrganizerComponent } from './organizer/login-organizer/login-organizer.component';
import { DashboardOrganizerComponent } from './dashboard/dashboard-organizer/dashboard-organizer.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register-organizer', component: OrganizerRegisterComponent },
  { path: 'login-organizer', component: LoginOrganizerComponent },
  { path: 'dashboard-organizer', component: DashboardOrganizerComponent },

  // rutas futuras
  // { path: 'organizer/dashboard', component: DashboardComponent },
  // { path: 'guest/event/:id', component: GuestEventComponent },
  // { path: 'super-admin', component: SuperAdminComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
