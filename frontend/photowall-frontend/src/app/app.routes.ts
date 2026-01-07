import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing/landing.component';
import { OrganizerRegisterComponent } from './landing/register-organizer/register-organizer.component';
import { LoginOrganizerComponent } from './organizer/login-organizer/login-organizer.component';
import { DashboardOrganizerComponent } from './dashboard/dashboard-organizer/dashboard-organizer.component';
import { EventTypeSelectComponent } from './events/event-type-select/event-type-select.component';
import { EventCreateComponent } from './events/event-create/event-create.component';
import { ManageComponent } from './organizer/events/manage/manage.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'register-organizer', component: OrganizerRegisterComponent },
  { path: 'login-organizer', component: LoginOrganizerComponent },
  { path: 'organizer/dashboard', component: DashboardOrganizerComponent },
  { path: 'organizer/events/create',component: EventTypeSelectComponent },
  { path: 'organizer/events/create/:type', component: EventCreateComponent},
  {path: 'organizer/events/:eventId/manage', component: ManageComponent}

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
